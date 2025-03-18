import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Trade {
  id: string;
  price: string;
  quantity: string;
  time: string;
  isBuyerMaker: boolean;
}

interface TradeListProps {
  trades: Trade[];
}

export function TradesList({
  trades,
  symbol,
  previousPrice,
  lastPrice,
}: TradeListProps & {
  symbol: string;
  previousPrice: string;
  lastPrice: string;
}) {
  const getPriceChangeColor = () => {
    if (!previousPrice || !lastPrice) return "";
    return Number.parseFloat(lastPrice) > Number.parseFloat(previousPrice)
      ? "text-green-500"
      : Number.parseFloat(lastPrice) < Number.parseFloat(previousPrice)
      ? "text-red-500"
      : "";
  };

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <div className="flex items-center justify-between p-4 px-6 bg-muted rounded-xl">
        <div className="w-auto">
          <h3 className="text-sm font-medium text-muted-foreground">Пара</h3>
          <p className="text-xl font-bold uppercase">{symbol}</p>
        </div>
        <div className="w-auto">
          <h3 className="text-sm font-medium text-muted-foreground">Статус</h3>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/10"
          >
            Connected
          </Badge>
        </div>
        <div className="w-[120px]">
          <h3 className="text-sm font-medium text-muted-foreground">Цена</h3>
          <p className={`text-xl font-bold ${getPriceChangeColor()}`}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number(lastPrice))}
          </p>
        </div>
      </div>
      <div className="bg-white border-neutral-300/50 overflow-hidden rounded-xl border dark:bg-neutral-950">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-100/50 dark:bg-neutral-800/50">
              <TableHead className="h-9 py-2 px-6 text-center">Время</TableHead>
              <TableHead className="h-9 py-2 px-6 text-center">
                Количество
              </TableHead>
              <TableHead className="h-9 py-2 px-6 text-center">Цена</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="py-2 px-6 font-medium text-center">
                  {new Date(trade.time).toLocaleTimeString()}
                </TableCell>
                <TableCell className="py-2 px-6 text-center">
                  {Number.parseFloat(trade.quantity).toFixed(6)}
                </TableCell>
                <TableCell
                  className={
                    trade.isBuyerMaker
                      ? "text-red-500 py-2 px-6 text-center"
                      : "text-green-500 py-2 px-6 text-center"
                  }
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(trade.price))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
