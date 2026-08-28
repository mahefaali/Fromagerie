import React, { useState, useMemo } from 'react';
import {
    TrendingDown,
    ShieldAlert,
    Package,
    RotateCcw,
    Euro,
    BarChart3,
    Coins,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { Card, CardContent } from './../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';

import { useOrders } from './../hooks/useOrders';
import { DeclareImproperModal } from './DeclareImproperModal';
import { RegisterReturnModal, type ReturnItemFormState } from './RegisterReturnModal';

interface StatItem {
    id: string;
    label: string;
    value: string | number;
    icon: React.ElementType;
}

interface ProductionCostItem {
    id: string;
    name: string;
    unitCost: number | string;
}

export interface LossLogEntry {
    id: string;
    cheeseName: string;
    badgeText: string;
    dateFormatted: string;
    lotNumber: string;
    orderNumber: string;
    clientName: string;
    reason: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
}

export const UnsoldLossView: React.FC = () => {
    const [subTab, setSubTab] = useState<string>('retours');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any | null>(null);
    const [orderReturns, setOrderReturns] = useState<Record<string, { returnCount: number; items: Record<string, number> }>>({});
    const [lossEntries, setLossEntries] = useState<LossLogEntry[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const { allOrders, orders } = useOrders();

    const deliveredOrders = useMemo(() => {
        const dataSource = allOrders ?? orders ?? [];
        return dataSource.filter((order) => order.status === 'delivered');
    }, [allOrders, orders]);

    const [productionCosts, setProductionCosts] = useState<ProductionCostItem[]>([
        { id: '1', name: "Bleu d'auvergne", unitCost: 6.8 },
        { id: '2', name: 'Camembert fermier', unitCost: 4.2 },
        { id: '3', name: 'Tomme de montagne', unitCost: 13.5 },
    ]);

    // KPICalculs
    const totalLostPieces = useMemo(() => {
        return lossEntries.reduce((sum, item) => sum + item.quantity, 0);
    }, [lossEntries]);

    const totalUnsoldCount = useMemo(() => {
        return Object.values(orderReturns).reduce((sum, current) => {
            const returnedQtySum = Object.values(current.items).reduce((a, b) => a + b, 0);
            return sum + returnedQtySum;
        }, 0);
    }, [orderReturns]);

    const totalLossCostFormatted = useMemo(() => {
        const total = lossEntries.reduce((sum, item) => sum + item.totalCost, 0);
        return `${total.toFixed(2)} €`;
    }, [lossEntries]);

    const kpiStats: StatItem[] = [
        { id: 'lost-pieces', label: 'Pièces perdues', value: totalLostPieces, icon: Package },
        { id: 'unsold', label: 'Invendus', value: totalUnsoldCount, icon: RotateCcw },
        { id: 'defects', label: "Défauts d'affinage", value: lossEntries.filter(l => l.badgeText === "Défaut d'affinage").length, icon: ShieldAlert },
        { id: 'total-cost', label: 'Coût total des pertes', value: totalLossCostFormatted, icon: Euro },
    ];

    const handleCostChange = (id: string, value: string) => {
        setProductionCosts((prev) =>
            prev.map((item) => (item.id === id ? { ...item, unitCost: value } : item))
        );
    };

    const handleDeleteLossEntry = (id: string) => {
        setLossEntries((prev) => prev.filter((item) => item.id !== id));
    };

    // Callback 1 : Soumission Déclarer un fromage impropre
    const handleDeclareImproperSubmit = (data: any) => {
        // 1. Extraction rigoureuse du nom du fromage selon le payload de la modale
        let rawCheeseName =
            data.cheeseName ||
            data.cheese ||
            data.cheeseType ||
            data.cheeseTitle ||
            '';

        // Si la modale renvoie un ID (ex: '1', '2'), on retrouve le nom dans productionCosts
        if (data.cheeseId || (rawCheeseName && !isNaN(Number(rawCheeseName)))) {
            const targetId = String(data.cheeseId || rawCheeseName);
            const match = productionCosts.find((p) => String(p.id) === targetId);
            if (match) {
                rawCheeseName = match.name;
            }
        }

        // Fallback propre au premier fromage de la liste si non trouvé
        const cheeseName = rawCheeseName.trim() || productionCosts[0]?.name || 'Tomme de montagne';

        const qty = Number(data.quantity || data.qty || data.count || 1);
        const lot = data.lotNumber || data.lot || 'Lot interne';
        const reason = data.reason || data.motive || "Défaut d'affinage";
        const dateStr = data.date || new Date().toISOString().split('T')[0];

        // 2. Recherche du coût unitaire avec comparaison insensible à la casse / espaces
        const foundCost = productionCosts.find(
            (p) => p.name.trim().toLowerCase() === cheeseName.trim().toLowerCase()
        );
        const unitCost = foundCost ? Number(foundCost.unitCost) : 13.5;

        // 3. Formatage de la date
        let formattedDate = dateStr;
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                formattedDate = d.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
            }
        } catch {
            formattedDate = dateStr;
        }

        const newEntry: LossLogEntry = {
            id: `loss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            cheeseName: cheeseName, // Nom exact harmonisé
            badgeText: "Défaut d'affinage",
            dateFormatted: formattedDate,
            lotNumber: lot,
            orderNumber: 'Interne',
            clientName: 'Production / Cave',
            reason: reason,
            quantity: qty,
            unitCost: unitCost,
            totalCost: unitCost * qty,
        };

        setLossEntries((prev) => [newEntry, ...prev]);
        setIsModalOpen(false);
        setSubTab('journal');

        setToastMessage(`Déclaration enregistrée pour ${cheeseName}.`);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Callback 2 : Soumission Retour d'invendus
    const handleReturnSubmit = (data: {
        orderId: string;
        returnDate: string;
        operator: string;
        generalNote: string;
        items: ReturnItemFormState[];
    }) => {
        const { orderId, returnDate, items } = data;
        const currentOrder = selectedOrderForReturn;
        const orderNum = currentOrder?.orderNumber || currentOrder?.id || orderId;
        const clientName = currentOrder?.clientName || 'Client';

        // 1. Sauvegarde des quantités retournées globales pour la commande
        setOrderReturns((prev) => {
            const currentReturnData = prev[orderId] || { returnCount: 0, items: {} };
            const updatedItems = { ...currentReturnData.items };

            items.forEach((item) => {
                const name = item.cheeseName || 'Fromage';
                updatedItems[name] = (updatedItems[name] || 0) + Number(item.returnedQuantity || 0);
            });

            return {
                ...prev,
                [orderId]: {
                    returnCount: currentReturnData.returnCount + 1,
                    items: updatedItems,
                },
            };
        });

        // 2. Génération des entrées du journal des pertes UNIQUEMENT pour les articles 'Déclarés en perte'
        const newLosses: LossLogEntry[] = [];

        items.forEach((item) => {
            const qty = Number(item.returnedQuantity || 0);
            // On vérifie que la quantité > 0 ET que la destination choisie est 'loss'
            if (qty > 0 && item.destination === 'loss') {
                const cheeseName = item.cheeseName || 'Fromage';
                const foundCost = productionCosts.find(
                    (p) => p.name.trim().toLowerCase() === cheeseName.trim().toLowerCase()
                );
                const unitCost = foundCost ? Number(foundCost.unitCost) : 13.5;

                let formattedDate = returnDate;
                if (returnDate) {
                    const parts = returnDate.split('-');
                    if (parts.length === 3) {
                        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                        formattedDate = dateObj.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        });
                    }
                }

                newLosses.push({
                    id: `loss-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    cheeseName: cheeseName,
                    badgeText: 'Invendu retourné',
                    dateFormatted: formattedDate || '20 août 2026',
                    lotNumber: `lot ${orderNum}-RET`,
                    orderNumber: orderNum,
                    clientName: clientName,
                    reason: item.reason?.trim() ? item.reason : 'Invendu marché / Retour',
                    quantity: qty,
                    unitCost: unitCost,
                    totalCost: unitCost * qty,
                });
            }
        });

        if (newLosses.length > 0) {
            setLossEntries((prev) => [...newLosses, ...prev]);
        }

        setSubTab('analyse'); // Bascule directement vers l'onglet Analyse pour visualiser le taux mis à jour
        setToastMessage(`Retour enregistré pour ${orderNum}.`);
        setTimeout(() => setToastMessage(null), 4000);
        setSelectedOrderForReturn(null);
    };

    return (
        <div className="space-y-6 relative">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2.5 bg-white text-stone-900 font-semibold text-sm px-4 py-3 rounded-2xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <CheckCircle2 className="h-5 w-5 text-black fill-white" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                    <h1 className="text-2xl font-bold tracking-tight">Invendus & pertes</h1>
                </div>
                <p className="text-sm text-stone-500">
                    Retours d'invendus, fromages impropres à la vente, coût des pertes et taux de perte par fromage et par mois.
                </p>
            </div>

            <div>
                <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white hover:bg-[#c84c28] text-stone-700 hover:text-white border-stone-300 hover:border-[#c84c28] rounded-xl px-4 py-2 flex items-center gap-2 font-medium shadow-sm transition-colors duration-200 cursor-pointer"
                >
                    <ShieldAlert className="h-4 w-4" />
                    Déclarer un fromage impropre
                </Button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.id} className="bg-white/60 border-stone-200/80 rounded-2xl shadow-none">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-2 text-stone-600 text-sm font-medium">
                                    <Icon className="h-4 w-4 text-stone-500" />
                                    <span>{stat.label}</span>
                                </div>
                                <div className="text-2xl font-semibold tracking-tight text-stone-900">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Modales */}
            <DeclareImproperModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleDeclareImproperSubmit}
            />

            <RegisterReturnModal
                isOpen={Boolean(selectedOrderForReturn)}
                order={selectedOrderForReturn}
                onClose={() => setSelectedOrderForReturn(null)}
                onSubmit={handleReturnSubmit}
            />

            {/* Tabs */}
            <Tabs defaultValue="retours" value={subTab} onValueChange={setSubTab} className="w-full space-y-6">
                <TabsList className="bg-[#EFECE6] p-1 rounded-2xl inline-flex gap-1">
                    <TabsTrigger
                        value="retours"
                        className="rounded-xl px-4 py-2 text-sm font-medium transition-all text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm cursor-pointer"
                    >
                        Retours d'invendus
                    </TabsTrigger>
                    <TabsTrigger
                        value="journal"
                        className="rounded-xl px-4 py-2 text-sm font-medium transition-all text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm cursor-pointer"
                    >
                        Journal des pertes
                    </TabsTrigger>
                    <TabsTrigger
                        value="analyse"
                        className="rounded-xl px-4 py-2 text-sm font-medium transition-all text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm cursor-pointer"
                    >
                        Analyse & taux
                    </TabsTrigger>
                    <TabsTrigger
                        value="couts"
                        className="rounded-xl px-4 py-2 text-sm font-medium transition-all text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm cursor-pointer"
                    >
                        Coûts de production
                    </TabsTrigger>
                </TabsList>

                {/* Retours */}
                <TabsContent value="retours" className="space-y-4">
                    {deliveredOrders.length === 0 ? (
                        <div className="w-full py-12 px-4 rounded-2xl border border-dashed border-stone-300 bg-white/40 flex items-center justify-center">
                            <span className="text-stone-500 text-sm font-medium">
                                Aucune commande livrée pour l'instant.
                            </span>
                        </div>
                    ) : (
                        deliveredOrders.map((order) => {
                            const rawItems = order.items || [];
                            const savedReturnData = orderReturns[order.id];

                            const items = rawItems.map((item: any) => {
                                const name = item.cheeseName || item.name || 'Fromage';
                                const quantity = item.quantity || 0;
                                const returnedQuantity =
                                    savedReturnData?.items[name] !== undefined
                                        ? savedReturnData.items[name]
                                        : item.returnedQuantity || 0;

                                return {
                                    ...item,
                                    name,
                                    quantity,
                                    returnedQuantity,
                                };
                            });

                            const totalDelivered = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                            const totalReturned = items.reduce((sum: number, item: any) => sum + item.returnedQuantity, 0);
                            const actuallySold = totalDelivered - totalReturned;
                            const returnCount = savedReturnData?.returnCount || 0;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-[#F2ECE1]/80 border border-stone-300/80 rounded-2xl p-5 space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-stone-900 font-bold text-base">
                                                {(order as any).orderNumber || order.id}{' '}
                                                <span className="font-normal text-stone-600">— {order.clientName || 'Client'}</span>
                                            </h3>
                                            <p className="text-xs text-stone-500 font-medium mt-0.5">
                                                {(order as any).deliveryDate ? `Livrée le ${(order as any).deliveryDate}` : 'Commande livrée'}
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => setSelectedOrderForReturn(order)}
                                            className="bg-[#2d4a27] hover:bg-[#233a1e] text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm cursor-pointer"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Enregistrer un retour
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-3 max-w-lg gap-4 py-1">
                                        <div>
                                            <span className="text-xs text-stone-500 font-medium block">Quantité livrée</span>
                                            <span className="text-stone-900 font-semibold text-lg">{totalDelivered}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-stone-500 font-medium block">Quantité retournée</span>
                                            <span className="text-stone-900 font-semibold text-lg">{totalReturned}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-stone-500 font-medium block">Réellement vendue</span>
                                            <span className="text-stone-900 font-semibold text-lg">{actuallySold}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-1">
                                        {items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-stone-200/40 rounded-xl text-sm">
                                                <span className="text-stone-800 font-medium">{item.name}</span>
                                                <span className="text-stone-500 text-xs font-medium">
                                                    livré {item.quantity} unite · retourné {item.returnedQuantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {returnCount > 0 && (
                                        <p className="text-xs text-stone-500 font-medium pt-1">
                                            {returnCount} retour(s) enregistré(s).
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </TabsContent>

                {/* Journal des pertes */}
                <TabsContent value="journal" className="space-y-3">
                    {lossEntries.length === 0 ? (
                        <div className="w-full py-12 px-4 rounded-2xl border border-dashed border-stone-300 bg-white/40 flex items-center justify-center">
                            <span className="text-stone-500 text-sm font-medium">
                                Aucun journal de perte enregistré.
                            </span>
                        </div>
                    ) : (
                        lossEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="bg-[#FAF7F2]/80 border border-stone-200/90 rounded-2xl p-4 flex items-start justify-between gap-4 transition-all"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-stone-900 font-bold text-base">
                                            {entry.cheeseName}
                                        </h3>
                                        <span className="bg-[#c84c28] text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                                            {entry.badgeText}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500 font-medium">
                                        {entry.dateFormatted} · {entry.lotNumber} · {entry.orderNumber} · {entry.clientName}
                                    </p>
                                    <p className="text-xs text-stone-600 font-normal pt-0.5">
                                        {entry.reason}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <span className="text-stone-900 font-bold text-base block">
                                            {entry.quantity} pcs
                                        </span>
                                        <span className="text-xs text-stone-500 font-medium block mt-0.5">
                                            {entry.quantity} × {entry.unitCost.toFixed(2)} € ={' '}
                                            <span className="text-[#c84c28] font-bold">
                                                {entry.totalCost.toFixed(2)} €
                                            </span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteLossEntry(entry.id)}
                                        className="text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer"
                                        title="Supprimer la perte"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </TabsContent>

                {/* Analyse & taux */}
                <TabsContent value="analyse" className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-stone-900 font-semibold text-lg">
                            <BarChart3 className="h-5 w-5 text-[#2d4a27]" />
                            <h2>Pourquoi je perds : causes par fromage</h2>
                        </div>

                        {lossEntries.length === 0 ? (
                            <div className="w-full py-8 px-4 rounded-2xl border border-dashed border-stone-300 bg-white/40 flex items-center justify-center">
                                <span className="text-stone-500 text-sm font-medium">
                                    Aucune perte enregistrée pour le moment.
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(
                                    lossEntries.reduce((acc, entry) => {
                                        const key = `${entry.cheeseName}-${entry.badgeText}`;
                                        if (!acc[key]) {
                                            acc[key] = {
                                                name: entry.cheeseName,
                                                badgeText: entry.badgeText,
                                                totalQty: 0,
                                                totalCost: 0,
                                            };
                                        }
                                        acc[key].totalQty += entry.quantity;
                                        acc[key].totalCost += entry.totalCost;
                                        return acc;
                                    }, {} as Record<string, { name: string; badgeText: string; totalQty: number; totalCost: number }>)
                                ).map(([key, item]) => (
                                    <div
                                        key={key}
                                        className="bg-[#FAF7F2]/80 border border-stone-200/90 rounded-2xl p-4 flex items-center justify-between"
                                    >
                                        <div>
                                            <h3 className="text-stone-900 font-bold text-base">{item.name}</h3>
                                            <p className="text-xs text-stone-500 font-medium mt-0.5">{item.badgeText}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-stone-900 font-bold text-base block">
                                                {item.totalQty} pcs
                                            </span>
                                            <span className="text-xs text-stone-500 font-medium block mt-0.5">
                                                {item.totalCost.toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 2 : Taux de perte par fromage et par mois */}
                    <div className="space-y-3">
                        <h2 className="text-stone-900 font-semibold text-lg">
                            Taux de perte par fromage et par mois
                        </h2>

                        <div className="space-y-3">
                            {(() => {
                                // 1. On rassemble TOUS les noms de fromages uniques provenant de toutes les sources
                                const allCheeseNames = Array.from(
                                    new Set([
                                        ...productionCosts.map((p) => p.name.trim()),
                                        ...lossEntries.map((l) => l.cheeseName.trim()),
                                        ...deliveredOrders.flatMap((o) =>
                                            (o.items || []).map((i: any) => (i.cheeseName || i.name || '').trim())
                                        ),
                                    ])
                                ).filter(Boolean);

                                if (allCheeseNames.length === 0) {
                                    return (
                                        <div className="w-full py-8 px-4 rounded-2xl border border-dashed border-stone-300 bg-white/40 flex items-center justify-center">
                                            <span className="text-stone-500 text-sm font-medium">
                                                Pas encore de données de ventes ni de pertes.
                                            </span>
                                        </div>
                                    );
                                }

                                return allCheeseNames.map((cheeseName) => {
                                    const normalizedName = cheeseName.toLowerCase();

                                    // 2. Calcul de la quantité et du coût perdus
                                    const lostQty = lossEntries
                                        .filter((l) => l.cheeseName.trim().toLowerCase() === normalizedName)
                                        .reduce((sum, l) => sum + l.quantity, 0);

                                    const lostCost = lossEntries
                                        .filter((l) => l.cheeseName.trim().toLowerCase() === normalizedName)
                                        .reduce((sum, l) => sum + l.totalCost, 0);

                                    // 3. Calcul de la quantité vendue (Livrée - Retournée)
                                    let soldQty = 0;
                                    deliveredOrders.forEach((order) => {
                                        const rawItems = order.items || [];
                                        const savedReturnData = orderReturns[order.id];

                                        rawItems.forEach((item: any) => {
                                            const name = (item.cheeseName || item.name || '').trim();
                                            if (name.toLowerCase() === normalizedName) {
                                                const delivered = Number(item.quantity || 0);
                                                const returned =
                                                    savedReturnData?.items[name] ?? Number(item.returnedQuantity || 0);
                                                soldQty += Math.max(0, delivered - returned);
                                            }
                                        });
                                    });

                                    const totalUnits = lostQty + soldQty;
                                    const lossRate = totalUnits > 0 ? (lostQty / totalUnits) * 100 : 0;

                                    return (
                                        <div
                                            key={cheeseName}
                                            className="bg-[#FAF7F2]/80 border border-stone-200/90 rounded-2xl p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-stone-900 font-bold text-base">
                                                    {cheeseName} <span className="font-normal text-stone-500">— août 2026</span>
                                                </h3>
                                                <span className="text-stone-900 font-bold text-base">
                                                    {lossRate.toFixed(1)} % de perte
                                                </span>
                                            </div>

                                            {/* Jauge de progression */}
                                            <div className="w-full bg-[#E2DFD8] h-3 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-[#2d4a27] h-full transition-all duration-500 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(0, lossRate))}%` }}
                                                />
                                            </div>

                                            <p className="text-xs text-stone-500 font-medium">
                                                {lostQty} perdu(s) · {soldQty} vendu(s) · {lostCost.toFixed(2)} € de perte
                                            </p>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </TabsContent>

                {/* Coûts de production */}
                <TabsContent value="couts" className="space-y-4">
                    <p className="text-sm text-stone-500 font-medium">
                        Coût de production estimé par pièce : il sert au calcul automatique du coût des pertes (quantité perdue × coût unitaire).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {productionCosts.map((cheese) => (
                            <div
                                key={cheese.id}
                                className="flex items-center justify-between p-3.5 bg-white/60 border border-stone-200/80 rounded-2xl shadow-sm"
                            >
                                <div className="flex items-center gap-2.5 text-stone-800 font-medium text-sm">
                                    <Coins className="h-4 w-4 text-stone-500" />
                                    <span>{cheese.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={cheese.unitCost}
                                        onChange={(e) => handleCostChange(cheese.id, e.target.value)}
                                        className="w-24 text-right bg-stone-100/80 border-stone-200 rounded-xl text-stone-900 font-medium h-9 focus-visible:ring-stone-400"
                                    />
                                    <span className="text-stone-600 font-medium text-sm">€</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};