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
    <Card className="max-w-md border-[#e8e2d5] p-5 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            {item.code}
          </span>
        </div>
        {item.isExpired ? (
          <Badge variant="destructive">{item.durabilityType} dépassée</Badge>
        ) : item.isExpiringSoon ? (
          <Badge variant="destructive">Bientôt périmé</Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 my-4 text-xs">
        <div>
          <span className="text-gray-500 block">Quantité</span>
          <span className="font-bold text-sm text-gray-900">
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

      <div className="text-xs mb-3">
        <span className={item.isExpired ? 'font-semibold text-red-700' : 'text-gray-600'}>
          {item.isExpired
            ? `${item.durabilityType} dépassée de ${Math.abs(item.daysBeforeDlc)} jour(s)`
            : item.daysBeforeDlc === 0
              ? `${item.durabilityType} atteinte aujourd'hui`
              : `${item.daysBeforeDlc} jour(s) avant ${item.durabilityType}`}
        </span>
      </div>

      {/* Barre de progression de la durabilité */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
        <div className={`${item.isExpired ? 'bg-red-600' : 'bg-[#2d5a37]'} h-full w-2/3 rounded-full`} />
      </div>

      {item.isExpiringSoon && (
        <div className="bg-[#fdf2ee] border border-[#f5d0c5] rounded-lg p-2.5 text-xs flex items-center gap-2 text-gray-800 mt-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Ce fromage arrive bientôt à sa {item.durabilityType === 'DLC' ? 'date limite de consommation' : 'date de durabilité minimale'}
          </span>
        </div>
      )}
      {item.isExpired && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs flex items-center gap-2 text-red-900 mt-2">
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
                  className="mt-4 w-full"
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
