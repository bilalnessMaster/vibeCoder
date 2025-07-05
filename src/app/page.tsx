import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function Home() {
  const user = await prisma.user.findMany({
    where: {}
  })
  return (
    <div className="h-screen w-full items-center flex-col flex justify-center bg-neutral-900 text-neutral-300">
      <h1>hello the first components</h1>
      <div className="max-w-(--breakpoint-sm)">
      {JSON.stringify(user , null, 3)}
      </div>
    </div>
  );
}
