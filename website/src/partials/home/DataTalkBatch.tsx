import clsx from "clsx";
import { Panel } from "../general/Panel";
import { ContainerInnerPaddingMixin } from "../styles";
import { DataTalkDemo } from "./DataTalkDemo";

export function DataTalkBatch(): JSX.Element {
    return <Panel color={"dark_gray"} includePadding={false}>
        <div className={clsx(ContainerInnerPaddingMixin, "text-white my-16")}>
            <h2 className="relative items-center uppercase mt-8">
                <span className="font-mono">Batch updates without scripts</span>
            </h2>

            <div className="mt-8 text-xl md:text-2xl">
                <p>
                    Operate directly in your data, without the need of writing scripts
                </p>
                <p>
                    <b>DataTalk</b> allows you to write queries and updates in a simple
                    way, using the same syntax as your database.
                </p>
                <p>
                    Export your custom reports to <b>CSV or JSON</b>
                </p>
            </div>
            <DataTalkDemo exchanges={[
                {
                    query: "Update user status to 'active' for users who signed up last month",
                    responseText:
                        "This code updates the status of users who signed up in the last month to 'active'.",
                    code: `export default async () => {
  const firestore = getFirestore();
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const usersRef = collection(firestore, "users");
  const q = query(
    usersRef,
    where("signupDate", ">=", lastMonth),
    where("signupDate", "<=", now)
  );

  const batch = writeBatch(firestore);
  const snapshot = await getDocs(q);
  
  snapshot.forEach((doc) => {
    batch.update(doc.ref, { status: "active" });
  });

  await batch.commit();
  return snapshot.size; // Return number of updated users
};`,
                },
                {
                    query: "Aggregate total sales by region for the last quarter",
                    responseText: "This query aggregates sales data by region for the last quarter and returns them sorted by total revenue.",
                    code: `export default async () => {
  const firestore = getFirestore();
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const salesRef = collection(firestore, "sales");
  const q = query(
    salesRef,
    where("date", ">=", threeMonthsAgo),
    where("date", "<=", now)
  );
  
  const snapshot = await getDocs(q);
  const salesByRegion = {};
  
  // Aggregate sales by region
  snapshot.forEach((doc) => {
    const data = doc.data();
    const region = data.region;
    const amount = data.amount || 0;
    
    if (!salesByRegion[region]) {
      salesByRegion[region] = {
        totalSales: 0,
        count: 0
      };
    }
    
    salesByRegion[region].totalSales += amount;
    salesByRegion[region].count += 1;
  });
  
  // Convert to array and sort by total sales
  const result = Object.entries(salesByRegion).map(([region, data]) => ({
    region,
    totalSales: data.totalSales,
    transactionCount: data.count,
    averageSale: data.totalSales / data.count
  })).sort((a, b) => b.totalSales - a.totalSales);
  
  return result;
};`,
                },
            ]}/>
        </div>
    </Panel>;
}
