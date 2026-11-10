import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const vehicleRates = [
  { type: "Motorcycle", plan: "Motorcycle", capacity: "20 kg", baseFare: "₱80" },
  { type: "Sedan", plan: "Sedan to L300", capacity: "200 kg", baseFare: "₱300" },
  { type: "L300 FB Van", plan: "Sedan to L300", capacity: "1,000 kg", baseFare: "₱1,200" },
  { type: "4W Closed Van", plan: "Truck", capacity: "2,500 kg", baseFare: "₱2,600" },
];

export function VehicleRatesSettings() {
  return (
    <Card aria-labelledby="vehicle-rates-heading" className="min-w-0 pb-0">
      <CardHeader>
        <CardTitle id="vehicle-rates-heading">Vehicle types and sample rates</CardTitle>
        <CardDescription>Reference fares used for booking estimates.</CardDescription>
      </CardHeader>
      <Table aria-labelledby="vehicle-rates-heading" className="min-w-[32rem]">
        <TableHeader className="border-t bg-muted/30">
          <TableRow>
            <TableHead scope="col" className="px-4 text-muted-foreground">Type</TableHead>
            <TableHead scope="col" className="px-4 text-muted-foreground">Subscription plan</TableHead>
            <TableHead scope="col" className="px-4 text-right text-muted-foreground">Capacity</TableHead>
            <TableHead scope="col" className="px-4 text-right text-muted-foreground">Base fare</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleRates.map(({ type, plan, capacity, baseFare }) => (
            <TableRow key={type}>
              <TableHead scope="row" className="px-4 font-medium">{type}</TableHead>
              <TableCell className="px-4 py-3">
                <Badge variant="secondary" className="rounded-md">{plan}</Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-right tabular-nums">{capacity}</TableCell>
              <TableCell className="px-4 py-3 text-right tabular-nums">{baseFare}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
