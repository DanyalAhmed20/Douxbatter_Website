import { DouxbatterLogo } from './icons';

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <DouxbatterLogo className="h-6 w-6 text-muted-foreground" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Douxbatter Delights. All rights reserved.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Built with passion &amp; a whole lot of butter.
        </p>
      </div>
    </footer>
  );
}
