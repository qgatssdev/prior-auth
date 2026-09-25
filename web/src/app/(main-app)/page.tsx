import type { Metadata } from "next";
import QueueView from "./components/queueView";

export const metadata: Metadata = { title: "Queue" };

const QueuePage = () => {
  return <QueueView />;
};

export default QueuePage;
