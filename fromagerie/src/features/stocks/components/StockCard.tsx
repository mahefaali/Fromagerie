import React from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface StockItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  affinageEndDate: string;
  dlcDate: string;
  daysBeforeDlc: number;
  durabilityType: 'DLC' | 'DDM';
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

interface StockCardProps {
  item: StockItem;
  declaringLoss?: boolean;
  onDeclareExpiredLoss?: (item: StockItem) => Promise<void>;
}

export const StockCard: React.FC<StockCardProps> = ({
  item,
  declaringLoss = false,
  onDeclareExpiredLoss,
}) => {
  return (
    <Card className="min-w-0 border-[#e8e2d5] p-3 shadow-sm sm:p-3.5">
      <div className="mb-1 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-gray-900">{item.name}</h3>
          <span className="block truncate font-mono text-[11px] uppercase tracking-wide text-gray-500">
            {item.code}
          </span>
        </div>
        {item.isExpired ? (
          <Badge variant="destructive">{item.durabilityType} dépassée</Badge>
        ) : item.isExpiringSoon ? (
          <Badge variant="destructive">Bientôt périmé</Badge>
        ) : null}
      </div>

      <div className="my-2.5 grid grid-cols-3 gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
        <div>
          <span className="text-gray-500 block">Quantité</span>
          <span className="text-xs font-bold text-gray-900 sm:text-sm">
            {item.quantity} {item.unit}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Sortie d'affinage</span>
          <span className="font-medium text-gray-800">{item.affinageEndDate}</span>
        </div>
        <div>
          <span className="text-gray-500 block">{item.durabilityType}</span>
          <span className="font-medium text-gray-800">{item.dlcDate}</span>
        </div>
      </div>

      <div className="mb-2.5 text-xs">
        <span className={item.isExpired ? 'font-semibold text-red-700' : 'text-gray-600'}>
          {item.isExpired
            ? `${item.durabilityType} dépassée de ${Math.abs(item.daysBeforeDlc)} jour(s)`
            : item.daysBeforeDlc === 0
              ? `${item.durabilityType} atteinte aujourd'hui`
              : `${item.daysBeforeDlc} jour(s) avant ${item.durabilityType}`}
        </span>
      </div>

      {/* Barre de progression de la durabilité */}
      <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`${item.isExpired ? 'bg-red-600' : 'bg-[#2d5a37]'} h-full w-2/3 rounded-full`} />
      </div>

      {item.isExpiringSoon && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#f5d0c5] bg-[#fdf2ee] p-2 text-[11px] leading-snug text-gray-800 sm:text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Ce fromage arrive bientôt à sa {item.durabilityType === 'DLC' ? 'date limite de consommation' : 'date de durabilité minimale'}
          </span>
        </div>
      )}
      {item.isExpired && (
        <>
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] leading-snug text-red-900 sm:text-xs">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>
              {item.durabilityType === 'DLC'
                ? 'La date limite de consommation de ce fromage est dépassée'
                : 'La date de durabilité minimale de ce fromage est dépassée'}
            </span>
          </div>

          {onDeclareExpiredLoss && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-3 h-9 w-full text-xs"
                  disabled={declaringLoss}
                >
                  <Trash2 />
                  {declaringLoss ? 'Déclaration en cours...' : 'Déclarer comme perte'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la déclaration de perte</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <span className="block">
                      Les {item.quantity} {item.unit}(s) du lot {item.code} seront déclarées comme
                      perte pour {item.durabilityType} dépassée.
                    </span>
                    <span className="block font-medium text-red-700">
                      Elles seront retirées du stock physique et ne seront plus revendables.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => void onDeclareExpiredLoss(item)}
                  >
                    Confirmer la perte
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </Card>
  );
};
