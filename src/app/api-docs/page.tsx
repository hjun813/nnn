import Link from "next/link";
import { SwaggerViewer } from "@/components/swagger-viewer";

export const metadata = { title: "ApplyFlow API Docs" };

export default function ApiDocsPage() {
  return <main className="swagger-page"><div className="swagger-top"><Link href="/dashboard">← ApplyFlow</Link><strong>OpenAPI 3.1</strong></div><SwaggerViewer /></main>;
}
