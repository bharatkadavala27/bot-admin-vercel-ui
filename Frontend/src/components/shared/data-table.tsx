import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: ReactNode[];
  children: ReactNode;
  className?: string;
  emptyMessage?: ReactNode;
  isEmpty?: boolean;
  footer?: ReactNode;
  maxHeight?: string | number;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords?: number;
  };
}

export function DataTable({ headers, children, className, emptyMessage, isEmpty, footer, pagination, maxHeight }: DataTableProps) {
  return (
    <Card className={cn("border border-border/60 bg-card overflow-hidden rounded-xl shadow-sm", className)}>
      <div
        className="overflow-auto scrollbar-thin"
        style={{ maxHeight: maxHeight }}
      >
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              {headers.map((header, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    "text-[12px] font-semibold text-muted-foreground py-3.5 px-4",
                    i === 0 && "pl-6",
                    i === headers.length - 1 && "text-right pr-6"
                  )}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
            {isEmpty && (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-32 text-center text-muted-foreground text-[13px]">
                  {emptyMessage || "No data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-3 gap-3 border-t border-border/50 bg-muted/5">
          <div className="text-[12px] text-muted-foreground font-medium text-center sm:text-left">
            <span className="hidden sm:inline">Showing page </span>
            <span className="text-foreground">{pagination.page}</span>
            <span className="hidden sm:inline"> of </span>
            <span className="sm:hidden mx-1">/</span>
            <span className="text-foreground">{pagination.totalPages}</span>
            {pagination.totalRecords !== undefined && (
              <span className="hidden md:inline"> · <span className="text-foreground">{pagination.totalRecords}</span> records</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg border-border/60 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-40"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages > 5 ? 3 : 5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 3) {
                  if (pagination.page > 2) {
                    pageNum = pagination.page - 1 + i;
                    if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (2 - i);
                  }
                }
                if (pageNum <= 0 || pageNum > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-[12px] rounded-lg transition-all",
                      pagination.page === pageNum ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => pagination.onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg border-border/60 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-40"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {footer}
    </Card>
  );
}

export function DataTableRow({ children, className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow className={cn("border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors", className)} {...props}>
      {children}
    </TableRow>
  );
}

export function DataTableCell({ children, className, isFirst, isLast, ...props }: React.ComponentProps<typeof TableCell> & { isFirst?: boolean; isLast?: boolean }) {
  return (
    <TableCell className={cn("py-4 px-4", isFirst && "pl-6", isLast && "pr-6", className)} {...props}>
      {children}
    </TableCell>
  );
}
