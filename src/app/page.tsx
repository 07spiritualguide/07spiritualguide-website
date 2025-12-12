import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/60 text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 md:px-12 lg:px-16">
        <section className="space-y-6 text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.4em] text-default-500">
            HeroUI + Tailwind CSS
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Beautiful components ready for your Next.js ideas.
          </h1>
          <p className="text-lg text-default-500 md:text-xl">
            The project starter already ships with Tailwind CSS, HeroUI, and
            TypeScript configured. Start composing gorgeous interfaces without
            writing boilerplate.
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-stretch">
            <Button
              color="primary"
              size="lg"
              className="w-full md:w-auto"
              as={Link}
              href="https://www.heroui.com/docs/frameworks/nextjs"
            >
              Launch the docs
            </Button>
            <Button
              variant="bordered"
              size="lg"
              className="w-full md:w-auto"
              as={Link}
              href="https://www.heroui.com/docs/components/button"
            >
              Explore components
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="backdrop-blur-3xl">
            <CardHeader className="flex flex-col items-start gap-2">
              <p className="text-small uppercase tracking-[0.3em] text-default-500">
                Sign up
              </p>
              <h2 className="text-2xl font-semibold">Capture leads with ease</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Name"
                placeholder="Alex Doe"
                variant="bordered"
                labelPlacement="outside"
              />
              <Input
                type="email"
                label="Email"
                placeholder="alex@company.com"
                variant="bordered"
                labelPlacement="outside"
              />
            </CardBody>
            <CardFooter className="flex flex-col gap-4 md:flex-row">
              <Button color="primary" className="w-full">
                Join the waitlist
              </Button>
              <Button variant="flat" className="w-full" as={Link} href="/docs">
                View API
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-default-100 bg-content1/70">
            <CardHeader>
              <div>
                <p className="text-small uppercase tracking-[0.32em] text-default-500">
                  Preview
                </p>
                <h2 className="text-2xl font-semibold">
                  HeroUI ready in seconds
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <p className="text-base text-default-500">
                Components render on the server, embrace the Next.js App Router,
                and inherit the Tailwind theme pipeline we set up in
                <code className="mx-1 rounded-md bg-default-100 px-1 py-0.5 text-small">
                  src/app/globals.css
                </code>
                .
              </p>
              <div className="rounded-large border border-dashed border-default-200 bg-background/30 p-4 text-sm">
                <p className="font-semibold text-default-700">What&apos;s next?</p>
                <ul className="list-disc space-y-1 pl-5 text-default-500">
                  <li>
                    Start the dev server with{" "}
                    <code className="rounded-md bg-default-100 px-1 py-0.5 text-small">
                      npm run dev
                    </code>
                    .
                  </li>
                  <li>Drop HeroUI primitives anywhere in your routes.</li>
                  <li>
                    Customize tokens in{" "}
                    <code className="rounded-md bg-default-100 px-1 py-0.5 text-small">
                      src/lib/hero.ts
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </CardBody>
            <CardFooter className="text-sm text-default-500">
              Need more examples? Browse{" "}
              <Link color="primary" href="https://www.heroui.com/docs">
                HeroUI docs
              </Link>
              .
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
