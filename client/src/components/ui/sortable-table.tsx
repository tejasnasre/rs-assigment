import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export type SortDirection = "asc" | "desc" | null;

export interface SortableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface SortableTableProps<T> {
  data: T[];
  columns: SortableColumn<T>[];
  sortKey: keyof T | string | null;
  sortDirection: SortDirection;
  onSort: (key: keyof T | string) => void;
  emptyMessage?: string;
  className?: string;
}

// Helper function to get nested property values
function getNestedValue<T>(obj: T, path: string): React.ReactNode {
  try {
    const keys = path.split(".");
    // Using unknown is more type-safe than any
    let current: unknown = obj;

    for (const key of keys) {
      if (current === undefined || current === null) return "";
      // We need to use any here because we can't know the exact shape
      // of the nested objects at compile time
      current = (current as Record<string, unknown>)[key];
    }

    // Convert to string or number for display
    if (typeof current === "object" && current !== null) {
      return JSON.stringify(current);
    }

    return current as React.ReactNode;
  } catch (error) {
    console.error(`Error accessing nested property ${path}:`, error);
    return "";
  }
}

export function SortableTable<T>({
  data,
  columns,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = "No data found",
  className,
}: SortableTableProps<T>) {
  const getSortIcon = (column: SortableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortKey === column.key) {
      if (sortDirection === "asc") {
        return <ChevronUp className="ml-1 h-4 w-4" />;
      } else if (sortDirection === "desc") {
        return <ChevronDown className="ml-1 h-4 w-4" />;
      }
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
  };

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={String(column.key)}
              className={`sticky top-0 bg-white ${
                column.sortable ? "cursor-pointer" : ""
              }`}
              onClick={() => column.sortable && onSort(column.key)}
            >
              <div className="flex items-center">
                {column.label}
                {getSortIcon(column)}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item)
                    : typeof column.key === "string" && column.key.includes(".")
                    ? getNestedValue(item, column.key)
                    : (item[column.key as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
