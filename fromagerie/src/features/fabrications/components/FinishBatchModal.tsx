import React, { useState } from 'react';
import { PackageCheck, X, Calendar } from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { FormGroup } from './../../../components/ui/formgroup';
import { Input } from './../../../components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from './../../../components/ui/select';
import { Textarea } from './../../../components/ui/textarea';
import { RadioCard } from './../../../components/ui/radiocard';

export interface BatchFormData {
  dateType: 'DLC' | 'DDM';
  dateValue: string;
  quantity: number;
  location: string;
  unitPrice?: number | string;
  notes?: string;
}

interface FinishBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchFormData) => void;
  batchName?: string;
  batchCode?: string;
}

export const FinishBatchModal: React.FC<FinishBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  batchName = 'Camembert fermier',
  batchCode = 'CAM-2026-118',
}) => {
  const [formData, setFormData] = useState<BatchFormData>({
    dateType: 'DLC',
    dateValue: '2026-09-05',
    quantity: 48,
    location: 'Chambre froide de vente',
    unitPrice: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const storageLocations = [
    { value: 'Chambre froide de vente', label: 'Chambre froide de vente' },
    { value: 'Cave 1 - Affinage', label: 'Cave 1 - Affinage' },
    { value: 'Stock principal', label: 'Stock principal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FAF7F2] border border-[#EBE5DB] rounded-3xl w-full max-w-lg shadow-xl overflow-hidden p-6 text-[#2C3228]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-6 h-6 text-[#234A23]" />
            <h2 className="text-xl font-semibold tracking-tight text-[#1C2119]">
              Terminer le lot
            </h2>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Fermer">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-6 pl-8">
          {batchName} — <span className="font-medium text-gray-700">{batchCode}</span> : sortie d'affinage et mise en stock.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Type de date de durabilité */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C3228]">
              Type de date de durabilité
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RadioCard
                id="dlc"
                name="dateType"
                value="DLC"
                checked={formData.dateType === 'DLC'}
                title="DLC"
                description="À consommer jusqu'au"
                onChange={(val) => setFormData({ ...formData, dateType: val as 'DLC' | 'DDM' })}
              />
              <RadioCard
                id="ddm"
                name="dateType"
                value="DDM"
                checked={formData.dateType === 'DDM'}
                title="DDM"
                description="À consommer de préférence avant"
                onChange={(val) => setFormData({ ...formData, dateType: val as 'DLC' | 'DDM' })}
              />
            </div>
          </div>

          {/* Grille : Date & Quantité */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label={`Date ${formData.dateType}`}>
              <Input
                type="date"
                value={formData.dateValue}
                onChange={(e) => setFormData({ ...formData, dateValue: e.target.value })}
                icon={<Calendar className="w-4 h-4" />}
              />
            </FormGroup>

            <FormGroup label="Quantité mise en stock">
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </FormGroup>
          </div>

          {/* Grille : Lieu & Prix */}
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Lieu de stockage">
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="bg-[#FAF7F2] border-[#E8E2D8] rounded-xl focus-visible:ring-[#274C23]/20 focus-visible:border-[#274C23]">
                    <SelectValue placeholder="Sélectionnez un lieu" />
                </SelectTrigger>
                <SelectContent className="bg-[#FAF7F2] border-[#E8E2D8] rounded-xl">
                {storageLocations.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    </SelectItem>
                ))}
                </SelectContent>
              </Select>

            </FormGroup>

            <FormGroup label="Prix de vente unitaire (€)">
              <Input
                type="number"
                placeholder="Optionnel"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </FormGroup>
          </div>

          {/* Note */}
          <FormGroup label="Note">
            <Textarea
              placeholder="Observations à la sortie d'affinage..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormGroup>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="default">
              Terminer et mettre en stock
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};