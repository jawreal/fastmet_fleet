import { Download, MoreHorizontal, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequirementImage } from "./RequirementImage";

export type StagedReplacement = { file: File; previewUrl: string };

const menuItem = "h-8 gap-2 px-2 text-xs font-medium focus:bg-muted";

export function ReplacementFigure({
  replacement: { file, previewUrl },
  onChangeFile,
  onRemove,
}: Readonly<{
  replacement: StagedReplacement;
  onChangeFile?: () => void;
  onRemove?: () => void;
}>) {
  const size =
    file.size >= 1024 ** 2
      ? `${(file.size / 1024 ** 2).toFixed(1)} MB`
      : `${Math.ceil(file.size / 1024)} KB`;
  const facts = `${size} · Not yet submitted`;

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex min-h-7 items-center justify-between gap-2 text-sm font-semibold">
        <span>Replacement document</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-[8px] hover:bg-muted dark:hover:bg-muted"
                aria-label={`More actions for ${file.name}`}
              />
            }
          >
            <MoreHorizontal
              aria-hidden="true"
              strokeWidth={2}
              className="size-4"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="requirements-menu w-48 rounded-[10px] border border-input bg-popover p-1 shadow-none ring-0"
          >
            {onChangeFile && (
              <DropdownMenuItem className={menuItem} onClick={onChangeFile}>
                <Upload
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-3.5 text-muted-foreground"
                />
                Change file
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className={menuItem}
              render={
                <a
                  href={previewUrl}
                  download={file.name}
                  aria-label="Download"
                />
              }
            >
              <Download
                aria-hidden="true"
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
              Download
            </DropdownMenuItem>
            {onRemove && (
              <>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                <DropdownMenuItem
                  className={`${menuItem} data-[variant=destructive]:focus:bg-muted dark:data-[variant=destructive]:focus:bg-muted`}
                  variant="destructive"
                  onClick={onRemove}
                >
                  <Trash2
                    aria-hidden="true"
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Remove replacement
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </figcaption>
      <RequirementImage
        key={previewUrl}
        name={file.name}
        src={previewUrl}
        details={facts}
        download
      />
    </figure>
  );
}
