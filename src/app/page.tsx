import { Greeting } from "@/components/greeting";
import { useTRPC } from "@/trpc/client";
import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({
    text: "bilal"
  }))
  const greeting = await caller.hello({
    text: "samir"
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>

      <div className="h-screen w-full items-center flex-col flex justify-center bg-neutral-900 text-neutral-300">
        <Greeting />
        {
          JSON.stringify(greeting)
        }
      </div>

    </HydrationBoundary>
  );
}
