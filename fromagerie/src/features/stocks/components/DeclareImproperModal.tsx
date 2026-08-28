import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './../../../components/ui/dialog';
import { Button } from './../../../components/ui/button';
import { Input } from './../../../components/ui/input';
import { Label } from './../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './../../../components/ui/select';

interface DeclareImproperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: DeclareFormData) => void;
}

export interface DeclareFormData {
    batchId: string;
    quantity: number;
    date: string;
    cause: string;
    defectType: string;
    operator: string;
    observation: string;
}

export const DeclareImproperModal: React.FC<DeclareImproperModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<DeclareFormData>({
        batchId: '',
        quantity: 1,
        date: '2026-08-19',
        cause: "Défaut d'affinage",
        defectType: 'Croûte anormale',
        operator: '',
        observation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-[#FBF9F5] border-stone-200 p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 text-left">
                    <DialogTitle className="text-xl font-bold text-stone-900">
                        Déclarer un fromage impropre à la vente
                    </DialogTitle>
                    <DialogDescription className="text-stone-500 text-sm">
                        Le lot est isolé du stock et tracé avec sa cause : le coût de la perte est calculé automatiquement.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Lot en stock */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-stone-800">Lot en stock</Label>
                        <Select
                            value={formData.batchId}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, batchId: val }))}
                        >
                            <SelectTrigger className="w-full bg-white/80 border-stone-200 rounded-xl text-stone-800 focus:ring-stone-400">
                                <SelectValue placeholder="Choisir un lot" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lot-001">Bleu d'Auvergne - Lot #2026-01</SelectItem>
                                <SelectItem value="lot-002">Camembert Fermier - Lot #2026-04</SelectItem>
                                <SelectItem value="lot-003">Tomme de Montagne - Lot #2026-12</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantité & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-stone-800">Quantité perdue</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                                }
                                className="bg-white/80 border-stone-200 rounded-xl text-stone-800 focus-visible:ring-stone-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-stone-800">Date du constat</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                className="bg-white/80 border-stone-200 rounded-xl text-stone-800 focus-visible:ring-stone-400"
                            />
                        </div>
                    </div>

                    {/* Cause */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-stone-800">Cause</Label>
                        <Select
                            value={formData.cause}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, cause: val }))}
                        >
                            <SelectTrigger className="w-full bg-white/80 border-stone-200 rounded-xl text-stone-800 focus:ring-stone-400">
                                <SelectValue placeholder="Sélectionner une cause" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Défaut d'affinage">Défaut d'affinage</SelectItem>
                                <SelectItem value="Casse / Manipulation">Casse / Manipulation</SelectItem>
                                <SelectItem value="Péremption">Péremption</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type de défaut */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-stone-800">Type de défaut</Label>
                        <Select
                            value={formData.defectType}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, defectType: val }))}
                        >
                            <SelectTrigger className="w-full bg-white/80 border-stone-200 rounded-xl text-stone-800 focus:ring-stone-400">
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Croûte anormale">Croûte anormale</SelectItem>
                                <SelectItem value="Moisissure indésirable">Moisissures indésirables</SelectItem>
                                <SelectItem value="Texture amollie">Texture amollie</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Opérateur */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-stone-800">Opérateur</Label>
                        <Input
                            type="text"
                            placeholder="Nom du responsable"
                            value={formData.operator}
                            onChange={(e) => setFormData((prev) => ({ ...prev, operator: e.target.value }))}
                            className="bg-white/80 border-stone-200 rounded-xl text-stone-800 focus-visible:ring-stone-400"
                        />
                    </div>

                    {/* Observation */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-stone-800">Observation</Label>
                        <textarea
                            rows={3}
                            placeholder="Remarques complémentaires ou détails sur le problème..."
                            value={formData.observation}
                            onChange={(e) => setFormData((prev) => ({ ...prev, observation: e.target.value }))}
                            className="w-full p-3 bg-white/80 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                        />
                    </div>

                    <DialogFooter className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-white hover:bg-stone-100 text-stone-800 border-stone-200 rounded-xl px-5 py-2 font-medium"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#2d4a27] hover:bg-[#233a1e] text-white rounded-xl px-5 py-2 font-medium shadow-sm"
                        >
                            Déclarer la perte
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};