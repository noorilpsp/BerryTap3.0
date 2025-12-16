import { Link } from "@/components/ui/link";
import { getMerchantsList } from "@/lib/queries";
import Image from "next/image";

export default async function Home() {
  const merchants = await getMerchantsList();
  let imageCount = 0;

  return (
    <div className="w-full p-4">
      <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
        Explore {merchants.length.toLocaleString()} merchants
      </div>
      <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
        {merchants.map((merchant) => (
          <Link
            prefetch={true}
            key={merchant.id}
            className="flex w-[125px] flex-col items-center text-center"
            href={`/admin/merchants/${merchant.id}`}
          >
            <Image
              loading={imageCount++ < 15 ? "eager" : "lazy"}
              decoding="sync"
              src={
                merchant.locations?.[0]?.logoUrl?.trimEnd() ||
                merchant.locations?.[0]?.bannerUrl?.trimEnd() ||
                "/placeholder.svg"
              }
              alt={`Logo for ${merchant.name}`}
              className="mb-2 h-14 w-14 border hover:bg-accent2"
              width={48}
              height={48}
              quality={65}
            />
            <span className="text-xs">{merchant.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
