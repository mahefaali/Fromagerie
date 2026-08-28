import React, { useEffect, useState } from 'react';
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
import { stockApi, type StockFromageFini } from '../api/stockApi';

interface DeclareImproperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: DeclareFormData) => void | Promise<boolean | void>;
}

export interface DeclareFormData {
    batchId: string;
    quantity: number;
    date: string;
    cause: string;
    defectType: string;
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
        date: new Date().toISOString().slice(0, 10),
        cause: "Défaut d'affinage",
        defectType: 'Croûte anormale',
        observation: '',
    });
    const [stocks, setStocks] = useState<StockFromageFini[]>([]);
    const [loadingStocks, setLoadingStocks] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingStocks(true);
        void stockApi.findStocks()
            .then((data) => setStocks(data.filter((stock) => stock.quantitePhysique > 0)))
            .catch((reason) => setError(reason instanceof Error ? reason.message : 'Chargement des lots impossible.'))
            .finally(() => setLoadingStocks(false));
    }, [isOpen]);

    const selectedStock = stocks.find((stock) => String(stock.id) === formData.batchId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStock) {
            setError('Sélectionnez un lot disponible.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await onSubmit?.(formData);
            if (result !== false) onClose();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Déclaration impossible.');
        } finally {
            setIsSubmitting(false);
        }
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
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, batchId: val, quantity: 1 }))}
                        >
                            <SelectTrigger className="w-full bg-white/80 border-stone-200 rounded-xl text-stone-800 focus:ring-stone-400">
                                <SelectValue placeholder="Choisir un lot" />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingStocks && <SelectItem value="loading" disabled>Chargement des lots...</SelectItem>}
                                {stocks.map((stock) => (
                                    <SelectItem key={stock.id} value={String(stock.id)}>
                                        {stock.fromageNom} - Lot {stock.numeroLotFabrication} ({stock.quantitePhysique} disponible(s))
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-sm text-red-600">{error}</p>}
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
                                    setFormData((prev) => ({
                                        ...prev,
                                        quantity: Math.min(Number(e.target.value), selectedStock?.quantitePhysique ?? Number(e.target.value)),
                                    }))
                                }
                                max={selectedStock?.quantitePhysique}
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
                            disabled={isSubmitting || loadingStocks || stocks.length === 0}
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
