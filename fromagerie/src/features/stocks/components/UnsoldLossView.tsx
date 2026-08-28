import React, { useEffect, useState, useMemo } from 'react';
import {
    TrendingDown,
    ShieldAlert,
    Package,
    RotateCcw,
    Euro,
    BarChart3,
    Coins,
    CheckCircle2,
    XCircle,
    Trash2
} from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { Card, CardContent } from './../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';

import { useOrders } from './../hooks/useOrders';
import { stockApi, type LossType, type ProductionCostApi, type StockFromageFini, type StockLossApi } from './../api/stockApi';
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
    dateIso: string;
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
    const [stockEntries, setStockEntries] = useState<StockFromageFini[]>([]);
    const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToastState({ message, type });
        window.setTimeout(() => setToastState(null), 4000);
    };

    const { allOrders, orders } = useOrders();

    const deliveredOrders = useMemo(() => {
        const dataSource = allOrders ?? orders ?? [];
        return dataSource.filter((order) => order.status === 'delivered');
    }, [allOrders, orders]);

    useEffect(() => {
        if (allOrders.length === 0) return;
        void stockApi.listLosses().then((losses: StockLossApi[]) => {
            const returnedByStock = losses.reduce<Record<number, number>>((result, loss) => {
                if (loss.typePerte === 'RETOUR_CLIENT') {
                    result[loss.stockId] = (result[loss.stockId] ?? 0) + loss.quantite;
                }
                return result;
            }, {});
            const returnedByReservation = losses.reduce<Record<number, number>>((result, loss) => {
                if (loss.typePerte === 'RETOUR_CLIENT' && loss.reservationId != null) {
                    result[loss.reservationId] = (result[loss.reservationId] ?? 0) + loss.quantite;
                }
                return result;
            }, {});
            const returnedByLot = losses.reduce<Record<string, number>>((result, loss) => {
                if (loss.typePerte === 'RETOUR_CLIENT' && loss.reservationId == null) {
                    result[loss.numeroLot] = (result[loss.numeroLot] ?? 0) + loss.quantite;
                }
                return result;
            }, {});
            const remainingByStock = { ...returnedByStock };
            const remainingByLot = { ...returnedByLot };
            // Legacy losses have no reservation id; allocate them once in reverse API order.
            const persistedReturns = [...allOrders].reverse().reduce<typeof orderReturns>((result, order) => {
                const items = order.items.reduce<Record<string, number>>((itemResult, item: any) => {
                    const delivered = Number(item.deliveredQuantity ?? item.quantity ?? 0);
                    const available = item.stockId ? remainingByStock[item.stockId] ?? 0 : 0;
                    const lotAvailable = item.batchCode ? remainingByLot[item.batchCode] ?? 0 : 0;
                    const key = String(item.reservationId ?? item.id ?? item.name ?? item.productName ?? 'Fromage');
                    const quantity = item.reservationId != null
                        ? Math.min(delivered, returnedByReservation[item.reservationId] ?? 0)
                        : item.batchCode && lotAvailable > 0
                            ? Math.min(delivered, lotAvailable)
                            : Math.min(delivered, available);
                    if (item.reservationId == null && item.batchCode && lotAvailable > 0) {
                        remainingByLot[item.batchCode] = lotAvailable - quantity;
                    } else if (item.stockId && item.reservationId == null) {
                        remainingByStock[item.stockId] = available - quantity;
                    }
                    if (quantity > 0) itemResult[key] = quantity;
                    return itemResult;
                }, {});
                if (Object.keys(items).length > 0) {
                    result[order.id] = { returnCount: 1, items };
                }
                return result;
            }, {});
            setOrderReturns((current) => ({ ...persistedReturns, ...current }));
        }).catch((error) => {
            showToast(error instanceof Error ? error.message : 'Chargement des retours impossible.', 'error');
        });
    }, [allOrders]);

    const [productionCosts, setProductionCosts] = useState<ProductionCostItem[]>([]);

    useEffect(() => {
        void Promise.all([stockApi.listCosts(), stockApi.listLosses(), stockApi.findStocks()]).then(([costs, losses, stocks]) => {
            setStockEntries(stocks);
            setProductionCosts(costs.map((cost: ProductionCostApi) => ({
                id: String(cost.fromageId),
                name: cost.fromageNom,
                unitCost: cost.coutUnitaire ?? '',
            })));
            setLossEntries(losses.map((loss) => ({
                id: String(loss.id),
                cheeseName: loss.fromageNom,
                badgeText: loss.typePerte === 'RETOUR_CLIENT' ? 'Invendu retourné' : loss.typePerte,
                dateFormatted: new Date(loss.dateHeure).toLocaleDateString('fr-FR'),
                dateIso: loss.dateHeure,
                lotNumber: loss.numeroLot,
                orderNumber: 'Interne',
                clientName: 'Stock',
                reason: loss.motif,
                quantity: loss.quantite,
                unitCost: Number(loss.coutUnitaireReference),
                totalCost: Number(loss.coutTotal),
            })));
        }).catch((error) => {
            showToast(error instanceof Error ? error.message : 'Chargement des coûts et pertes impossible.', 'error');
        });
    }, []);

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

    const monthlyLossRates = useMemo(() => {
        const rows = new Map<string, {
            cheeseName: string;
            month: string;
            enteredQuantity: number;
            lostQuantity: number;
            lostCost: number;
        }>();

        stockEntries.forEach((stock) => {
            const month = stock.dateEntreeStock?.slice(0, 7);
            if (!month) return;
            const key = `${stock.fromageNom.trim().toLowerCase()}::${month}`;
            const row = rows.get(key) ?? {
                cheeseName: stock.fromageNom,
                month,
                enteredQuantity: 0,
                lostQuantity: 0,
                lostCost: 0,
            };
            row.enteredQuantity += Number(stock.quantiteInitiale ?? 0);
            rows.set(key, row);
        });

        lossEntries.forEach((loss) => {
            const month = loss.dateIso?.slice(0, 7);
            if (!month) return;
            const key = `${loss.cheeseName.trim().toLowerCase()}::${month}`;
            const row = rows.get(key) ?? {
                cheeseName: loss.cheeseName,
                month,
                enteredQuantity: 0,
                lostQuantity: 0,
                lostCost: 0,
            };
            row.lostQuantity += loss.quantity;
            row.lostCost += loss.totalCost;
            rows.set(key, row);
        });

        return [...rows.values()]
            .map((row) => ({
                ...row,
                lossRate: row.enteredQuantity > 0 ? (row.lostQuantity / row.enteredQuantity) * 100 : 0,
                monthLabel: new Date(`${row.month}-01T00:00:00`).toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                }),
            }))
            .sort((a, b) => b.month.localeCompare(a.month) || a.cheeseName.localeCompare(b.cheeseName, 'fr'));
    }, [lossEntries, stockEntries]);

    const handleCostChange = (id: string, value: string) => {
        setProductionCosts((prev) =>
            prev.map((item) => (item.id === id ? { ...item, unitCost: value } : item))
        );
    };

    const handleCostSave = async (cheese: ProductionCostItem) => {
        const value = Number(cheese.unitCost);
        if (!Number.isFinite(value) || value < 0) {
            showToast('Saisissez un coût de production valide.', 'error');
            return;
        }
        try {
            const saved = await stockApi.updateCost(Number(cheese.id), { coutUnitaire: value });
            setProductionCosts((current) => current.map((item) => item.id === cheese.id
                ? { ...item, unitCost: saved.coutUnitaire ?? value }
                : item));
            showToast(`Coût paramétré pour ${saved.fromageNom}.`, 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Enregistrement du coût impossible.', 'error');
        }
    };

    const handleDeleteLossEntry = (id: string) => {
        setLossEntries((prev) => prev.filter((item) => item.id !== id));
    };

    // Callback 1 : Soumission Déclarer un fromage impropre
    const handleDeclareImproperSubmit = async (data: any): Promise<boolean> => {
        const stockId = Number(data.batchId);
        const typePerte: LossType = data.cause === "Défaut d'affinage"
            ? 'DEFAUT_AFFINAGE'
            : data.cause === 'Péremption' ? 'DLC_DDM_DEPASSEE' : 'AUTRE';
        const motif = [data.cause, data.defectType, data.observation].filter(Boolean).join(' - ');
        if (!Number.isInteger(stockId) || stockId <= 0) {
            showToast('Sélectionnez un lot disponible.', 'error');
            return false;
        }
        try {
            const saved = await stockApi.createLoss(stockId, {
                quantite: Number(data.quantity),
                typePerte,
                motif,
            });
            setLossEntries((current) => [{
                id: String(saved.id),
                cheeseName: saved.fromageNom,
                badgeText: saved.typePerte,
                dateFormatted: new Date(saved.dateHeure).toLocaleDateString('fr-FR'),
                dateIso: saved.dateHeure,
                lotNumber: saved.numeroLot,
                orderNumber: 'Interne',
                clientName: 'Stock',
                reason: saved.motif || motif,
                quantity: saved.quantite,
                unitCost: Number(saved.coutUnitaireReference),
                totalCost: Number(saved.coutTotal),
            }, ...current]);
            setSubTab('journal');
            showToast(`Déclaration enregistrée pour ${saved.fromageNom}.`, 'success');
            return true;
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Déclaration impossible.', 'error');
            return false;
        }
    };

    // Callback 2 : Soumission Retour d'invendus
    const handleReturnSubmit = async (data: {
        orderId: string;
        returnDate: string;
        items: ReturnItemFormState[];
    }): Promise<boolean> => {
        const { orderId, returnDate, items } = data;
        const currentOrder = selectedOrderForReturn;
        const orderNum = currentOrder?.orderNumber || currentOrder?.id || orderId;
        const cheeseLabel = [...new Set(items.map((item) => item.cheeseName || 'Fromage'))].join(', ');
        const clientName = currentOrder?.clientName || 'Client';

        try {
            await Promise.all(items.filter((item) => item.returnedQuantity > 0).map((item) => {
                if (!item.stockId) throw new Error(`Stock introuvable pour ${item.cheeseName}`);
                return stockApi.createLoss(item.stockId, {
                    quantite: item.returnedQuantity,
                    typePerte: 'RETOUR_CLIENT',
                    reservationId: item.reservationId,
                });
            }));
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Enregistrement du retour impossible.', 'error');
            return false;
        }

        // 1. Sauvegarde des quantités retournées globales pour la commande
        setOrderReturns((prev) => {
            const currentReturnData = prev[orderId] || { returnCount: 0, items: {} };
            const updatedItems = { ...currentReturnData.items };

            items.forEach((item) => {
                const key = String(item.reservationId ?? item.stockId ?? item.cheeseName ?? 'Fromage');
                updatedItems[key] = (updatedItems[key] || 0) + Number(item.returnedQuantity || 0);
            });

            return {
                ...prev,
                [orderId]: {
                    returnCount: currentReturnData.returnCount + 1,
                    items: updatedItems,
                },
            };
        });

        // 2. Génération des entrées du journal des pertes après confirmation du serveur.
        const newLosses: LossLogEntry[] = [];

        items.forEach((item) => {
            const qty = Number(item.returnedQuantity || 0);
            if (qty > 0) {
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
                    dateIso: returnDate,
                    lotNumber: `lot ${orderNum}-RET`,
                    orderNumber: orderNum,
                    clientName: clientName,
                    reason: 'Retour d\'invendus',
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
        showToast(`Retour d'invendus enregistré pour ${cheeseLabel}.`, 'success');
        setSelectedOrderForReturn(null);
        return true;
    };

    return (
        <div className="space-y-6 relative">
            {toastState && (
                <div className={`fixed bottom-6 right-6 z-[10000] flex items-center gap-2.5 text-white font-semibold text-sm px-4 py-3 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-bottom-3 duration-200 ${toastState.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-[#2d4a27] border-[#233a1e]'}`}>
                    {toastState.type === 'error' ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <span>{toastState.message}</span>
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
                                const key = String(item.reservationId ?? item.id ?? item.name ?? item.productName ?? 'Fromage');
                                const returnedQuantity =
                                    savedReturnData?.items[key] !== undefined
                                        ? savedReturnData.items[key]
                                        : item.returnedQuantity || 0;

                                return {
                                    ...item,
                                    name,
                                    quantity,
                                    returnedQuantity,
                                };
                            });

                            const totalDelivered = items.reduce(
                                (sum: number, item: any) => sum + Number(item.deliveredQuantity ?? item.quantity ?? 0),
                                0
                            );
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
                                            onClick={() => {
                                                const saved = orderReturns[order.id];
                                                setSelectedOrderForReturn({
                                                    ...order,
                                                    items: order.items.map((item: any) => ({
                                                        ...item,
                                                        returnedQuantity: saved?.items[String(item.reservationId ?? item.id ?? item.name ?? item.productName ?? 'Fromage')] ?? 0,
                                                    })),
                                                });
                                            }}
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
                                                    livré {Number(item.deliveredQuantity ?? item.quantity ?? 0)} unite · retourné {item.returnedQuantity}
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
                            {monthlyLossRates.length === 0 ? (
                                <div className="w-full py-8 px-4 rounded-2xl border border-dashed border-stone-300 bg-white/40 flex items-center justify-center">
                                    <span className="text-stone-500 text-sm font-medium">
                                        Aucune entrée en stock ni perte enregistrée.
                                    </span>
                                </div>
                            ) : monthlyLossRates.map((row) => (
                                <div
                                    key={`${row.cheeseName}-${row.month}`}
                                    className="bg-[#FAF7F2]/80 border border-stone-200/90 rounded-2xl p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-stone-900 font-bold text-base">
                                            {row.cheeseName} <span className="font-normal text-stone-500">— {row.monthLabel}</span>
                                        </h3>
                                        <span className="text-stone-900 font-bold text-base">
                                            {row.lossRate.toFixed(1)} % de perte
                                        </span>
                                    </div>

                                    <div className="w-full bg-[#E2DFD8] h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[#2d4a27] h-full transition-all duration-500 rounded-full"
                                            style={{ width: `${Math.min(100, Math.max(0, row.lossRate))}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-stone-500 font-medium">
                                        {row.lostQuantity} perdu(s) · {row.enteredQuantity} entré(s) en stock · {row.lostCost.toFixed(2)} € de perte
                                    </p>
                                </div>
                            ))}
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
                                    <Button
                                        type="button"
                                        onClick={() => void handleCostSave(cheese)}
                                        className="rounded-xl bg-[#2d4a27] px-3 py-2 text-xs text-white hover:bg-[#233a1e]"
                                    >
                                        Enregistrer
                                    </Button>
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
