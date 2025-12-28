
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  Timestamp,
  collectionGroup
} from "firebase/firestore";
import { db } from "./firebase";
import { Asset, Transaction, UserProfile, AssetCategory } from "../types";

export const dbService = {
  // Subscribes to real-time wallet changes
  subscribeToWallet: (uid: string, callback: (assets: Asset[]) => void) => {
    const q = collection(db, `users/${uid}/assets`);
    return onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Asset[];
      callback(assets);
    });
  },

  // Subscribes to real-time transaction history
  subscribeToTransactions: (uid: string, callback: (txs: Transaction[]) => void) => {
    const q = collection(db, `users/${uid}/transactions`);
    return onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString() : doc.data().date
      })) as Transaction[];
      callback(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
  },

  // Adds a transaction and updates the asset document (Cloud function logic alternative for client)
  registerTransaction: async (uid: string, ticker: string, tx: Omit<Transaction, 'id'>, category: AssetCategory) => {
    // 1. Add Transaction to sub-collection
    const txRef = await addDoc(collection(db, `users/${uid}/transactions`), {
      ...tx,
      ticker,
      category,
      date: Timestamp.fromDate(new Date(tx.date))
    });

    // 2. Update/Create Asset Summary (Denormalized for performance as per MongoDB/Firestore spec)
    const assetRef = doc(db, `users/${uid}/assets`, ticker);
    const assetSnap = await getDoc(assetRef);

    if (assetSnap.exists()) {
      const current = assetSnap.data() as Asset;
      let newQty = current.totalQuantity;
      let newAvgPrice = current.averagePrice;

      if (tx.type === 'buy') {
        const totalCost = (current.averagePrice * current.totalQuantity) + (tx.price * tx.quantity) + tx.fees;
        newQty += tx.quantity;
        newAvgPrice = totalCost / newQty;
      } else if (tx.type === 'sell') {
        newQty = Math.max(0, current.totalQuantity - tx.quantity);
      }

      await updateDoc(assetRef, {
        totalQuantity: newQty,
        averagePrice: newAvgPrice,
        lastUpdate: Timestamp.now()
      });
    } else {
      await setDoc(assetRef, {
        ticker,
        category,
        sector: category === AssetCategory.CRYPTO ? 'Ouro Digital' : 'Imobiliário',
        totalQuantity: tx.quantity,
        averagePrice: tx.price,
        currentPrice: tx.price, // Will be updated by price service
        dailyChange: 0,
        transactions: [], // Not used in Firestore as it's a sub-collection
        lastUpdate: Timestamp.now()
      });
    }
  },

  deleteTransaction: async (uid: string, txId: string, ticker: string) => {
    await deleteDoc(doc(db, `users/${uid}/transactions`, txId));
    // Note: In a production Firebase environment, a Cloud Function would trigger 
    // to recalculate the Preço Médio in users/{uid}/assets/{ticker}.
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    await updateDoc(doc(db, "users", uid), data);
  }
};
