import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function TablesHubPage() {
  return (
    <main className="h-full overflow-y-auto bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_84%_0%,rgba(16,185,129,0.1),transparent_32%),hsl(222,24%,8%)] p-3 text-foreground md:p-4">
      <div className="mx-auto grid w-full max-w-[1680px] gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[hsl(224,18%,12%)]/88 p-4 backdrop-blur-md">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100/90">Table Service</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Open floor map and manage seated tables from here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/floor-map">Open Floor Map</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/builder">Layout Builder</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[hsl(224,18%,12%)]/88 p-4 backdrop-blur-md">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100/90">Quick Table Links</h2>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((n) => (
              <Button key={n} variant="outline" className="h-9 bg-transparent px-0" asChild>
                <Link href={`/table/t${n}`}>T{n}</Link>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
