'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useState } from 'react'

const Page = () => {
  const [value, setValue] = useState('')
  const trpc = useTRPC();
  const {data : messages} = useQuery(trpc.messages.getMany.queryOptions());
  const prompt = useMutation(trpc.messages.create.mutationOptions());
  return (
    <div className="flex flex-col gap-y-2 items-center justify-center w-full h-screen">
      <Input  className="max-w-lg" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        type="button"
        className="cursor-pointer font-medium"
        disabled={prompt.isPending}
        onClick={() => prompt.mutate({ value })}>
        ask grok
      </Button>
      <div>
      {
        JSON.stringify(messages, null, 4)
      }
      </div>
    </div>
  );
}


export default Page;
