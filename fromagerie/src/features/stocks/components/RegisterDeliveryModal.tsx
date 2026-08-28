import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'lucide-react';
import { type Order } from './../types/orders';

interface RegisterDeliveryModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
    onSubmit: (data: {
        orderId: string;
        deliveryDate: string;
        deliveryNote: string;
        deliveredItems: { itemId: string; deliveredQuantity: number; gap: number }[];
    }) => void;
}

export const RegisterDeliveryModal: React.FC<RegisterDeliveryModalProps> = ({
    isOpen,
    order,
    onClose,
    onSubmit,
}) => {
    const getTodayISO = () => new Date().toISOString().split('T')[0];

    const [deliveryDate, setDeliveryDate] = useState<string>(getTodayISO());
    const [deliveredQuantities, setDeliveredQuantities] = useState<Record<string, number>>({});
    const [deliveryNote, setDeliveryNote] = useState<string>('');

    useEffect(() => {
        if (order) {
            setDeliveryDate(getTodayISO());
            setDeliveryNote('');
            const initialQtys: Record<string, number> = {};
            order.items?.forEach((item) => {
                initialQtys[item.id] = item.deliveredQuantity ?? item.quantity;
            });
            setDeliveredQuantities(initialQtys);
        }
    }, [order]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !order) return null;

    const handleQuantityChange = (itemId: string, val: string) => {
        const num = parseFloat(val);
        setDeliveredQuantities((prev) => ({
            ...prev,
            [itemId]: isNaN(num) ? 0 : num,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const deliveredItems = (order.items || []).map((item) => {
            const deliveredQty = deliveredQuantities[item.id] ?? item.quantity;
            const gap = deliveredQty - item.quantity;
            return {
                itemId: item.id,
                deliveredQuantity: deliveredQty,
                gap,
            };
        });

        onSubmit({
            orderId: order.id,
            deliveryDate,
            deliveryNote,
            deliveredItems,
        });

        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-[#fcfbfa] w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2dacb] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                {/* Header */}
                <div className="p-6 pb-4 flex items-start justify-between border-b border-[#e2dacb]/40 shrink-0">
                    <div>
                        <h2 className="text-lg font-extrabold text-[#2c2825]">
                            Enregistrer la livraison — {order.code || order.id}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Saisissez les quantités réellement livrées ; les écarts sont conservés.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body Scrollable */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Date de livraison */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#2c2825]">
                            Date de livraison
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                required
                                className="w-full bg-[#f5f2eb]/70 border border-[#e2dacb] rounded-xl px-3.5 py-2.5 text-sm text-[#2c2825] font-medium focus:outline-none focus:border-[#2d4a27] transition-all"
                            />
                            <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>

                    {/* Liste des articles */}
                    <div className="space-y-3">
                        {order.items?.map((item) => {
                            const itemName = item.name || item.productName || 'Article';
                            const unit = item.unit || 'u';
                            const deliveredVal = deliveredQuantities[item.id] ?? item.quantity;

                            // Écart = Livré - Commandé
                            const gap = deliveredVal - item.quantity;

                            // Formatage avec le signe + si positif
                            const formattedGap = gap > 0
                                ? `+${gap.toFixed(2)} ${unit}`
                                : `${gap.toFixed(2)} ${unit}`;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-[#f5f2eb]/60 rounded-2xl p-4 border border-[#e2dacb]/80 space-y-3"
                                >
                                    <div className="font-extrabold text-sm text-[#2c2825]">
                                        {itemName}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <div>
                                            <span className="block text-xs text-gray-500 font-medium mb-1">
                                                Commandé
                                            </span>
                                            <span className="text-sm font-extrabold text-[#2c2825]">
                                                {item.quantity} {unit}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-500 font-medium mb-1">
                                                Livré ({unit})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={deliveredVal}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                className="w-full bg-white/90 border border-[#e2dacb] rounded-xl px-3 py-2 text-sm font-bold text-[#2c2825] focus:outline-none focus:border-[#2d4a27] transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Affichage conditionnel : uniquement si l'écart est non nul */}
                                    {gap !== 0 && (
                                        <div className="text-xs font-semibold text-[#c85a32] pt-1">
                                            Écart : {formattedGap}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Note de livraison */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#2c2825]">
                            Note de livraison
                        </label>
                        <textarea
                            rows={3}
                            value={deliveryNote}
                            onChange={(e) => setDeliveryNote(e.target.value)}
                            className="w-full bg-[#f5f2eb]/50 border border-[#e2dacb] rounded-xl p-3 text-sm text-[#2c2825] focus:outline-none focus:border-[#2d4a27] resize-none transition-all"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-[#f0eae1] hover:bg-[#e4dcce] text-[#2c2825] text-xs font-bold transition-all cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#2d4a27] hover:bg-[#233a1e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};