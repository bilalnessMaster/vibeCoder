'use client'
import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";


export const Greeting = () => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.hello.queryOptions({ text: "bilal" }))
  return (
    <h1>
      {data.greeting}
    </h1>
  )
}
