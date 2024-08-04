import { getPageBySlugWithPageLinks } from "@/lib/api/pages/queries";
import { getUserAuth } from "@/lib/auth/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { page } = await getPageBySlugWithPageLinks(params.slug);
  if (page === undefined) notFound();
  return {
    title: page.name,
    description: page.description,
  };
}

export default async function SharedPage({
  params,
}: {
  params: { slug: string };
}) {
  const { session } = await getUserAuth();
  const { page, pageLinks } = await getPageBySlugWithPageLinks(params.slug);
  if (page === undefined) notFound();
  if (page.public === false) return <main>This page is not public</main>;
  return (
    <main>
      <div className="flex flex-col bg-gradient-to-b from-slate-900 to-slate-700 h-screen items-center justify-center py-8 px-4 text-center">
        <header className="mb-10">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-300">
              <img
                src={session?.user.avatar}
                alt={session?.user.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4 text-white">{page.name}</h1>
          <p className="text-white">{page.description}</p>
        </header>
        <nav className="flex-1 w-full max-w-xl flex flex-col gap-4">
          {pageLinks.map((l) => (
            <Link key={l.id} href={l.url}>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-200 transition-all duration-300 hover:scale-105 ease-out">
                <span className="text-gray-800">{l.title}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
