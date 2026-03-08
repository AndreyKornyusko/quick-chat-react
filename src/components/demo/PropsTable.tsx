import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface PropDef {
  name: string;
  type: string;
  default: string;
  required: boolean;
  description: string;
}

interface PropsTableProps {
  title: string;
  props: PropDef[];
}

export const PropsTable = ({ title, props }: PropsTableProps) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Prop</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Default</TableHead>
            <TableHead className="font-semibold text-center">Required</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="font-mono text-xs text-primary">{p.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{p.type}</TableCell>
              <TableCell className="font-mono text-xs">{p.default || "—"}</TableCell>
              <TableCell className="text-center">
                {p.required ? (
                  <Badge variant="destructive" className="text-[10px] px-1.5">Required</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5">Optional</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{p.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);
