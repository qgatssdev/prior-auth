import type { Metadata } from "next";
import DemoView from "./components/demoView";

export const metadata: Metadata = { title: "Demo tools" };

const DemoPage = () => {
  return <DemoView />;
};

export default DemoPage;
