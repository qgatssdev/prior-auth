import type { Metadata } from "next";
import CaseView from "./components/caseView";

export const metadata: Metadata = { title: "Case" };

const CasePage = async ({ params }: PageProps<"/cases/[id]">) => {
  const { id } = await params;
  return <CaseView id={id} />;
};

export default CasePage;
