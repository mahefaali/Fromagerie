import React, { useEffect, useState, useMemo } from 'react';
import {
    TrendingDown,
    ShieldAlert,
    Package,
    RotateCcw,
    Euro,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { Button } from './../../../components/ui/button';
import { Card, CardContent } from './../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './../../../components/ui/tabs';

import { useOrders } from './../hooks/useOrders';
import { stockApi, type LossType, type ProductionCostApi, type StockFromageFini, type StockLossApi } from './../api/stockApi';
import { DeclareImproperModal, type DeclareFormData } from './DeclareImproperModal';
import { RegisterReturnModal, type ReturnItemFormState } from './RegisterReturnModal';
import type { Order } from '../types/orders';
import type { LossLogEntry, OrderReturns, ProductionCostItem } from './unsoldLoss.types';
import { calculateAgingDefectQuantity, calculateAverageProductionCosts, calculateMonthlyLossRates, mapLossToLogEntry, rebuildPersistedReturns, summarizeLossCauses } from './unsoldLoss.utils';
import { LossAnalysisTab, LossJournalTab, ProductionCostsTab, ReturnsTab } from './UnsoldLossTabs';
import { profitabilityApi, type LotProductionCost } from '../../profitability/api/profitabilityApi';

interface StatItem {
    id: string;
    label: string;
    value: string | number;
    icon: React.ElementType;
}

export type { LossLogEntry } from './unsoldLoss.types';

export const UnsoldLossView: React.FC = () => {
    const [subTab, setSubTab] = useState<string>('retours');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
    const [orderReturns, setOrderReturns] = useState<OrderReturns>({});
    const [lossEntries, setLossEntries] = useState<LossLogEntry[]>([]);
    const [stockEntries, setStockEntries] = useState<StockFromageFini[]>([]);
    const [productionCostLots, setProductionCostLots] = useState<LotProductionCost[]>([]);
    const [productionCostLotsLoading, setProductionCostLotsLoading] = useState(true);
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
            const persistedReturns = rebuildPersistedReturns(allOrders, losses);
            setOrderReturns((current) => ({ ...persistedReturns, ...current }));
        }).catch((error) => {
            showToast(error instanceof Error ? error.message : 'Chargement des retours impossible.', 'error');
        });
    }, [allOrders]);

    const [productionCosts, setProductionCosts] = useState<ProductionCostItem[]>([]);

    useEffect(() => {
        void profitabilityApi.lots()
            .then(setProductionCostLots)
            .catch(() => setProductionCostLots([]))
            .finally(() => setProductionCostLotsLoading(false));
    }, []);

    useEffect(() => {
        void Promise.all([stockApi.listCosts(), stockApi.listLosses(), stockApi.findStocks()]).then(([costs, losses, stocks]) => {
            setStockEntries(stocks);
            setProductionCosts(costs.map((cost: ProductionCostApi) => ({
                id: String(cost.fromageId),
                name: cost.fromageNom,
                unitCost: cost.coutUnitaire ?? '',
            })));
            setLossEntries(losses.map(mapLossToLogEntry));
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
        { id: 'defects', label: "Défauts d'affinage", value: calculateAgingDefectQuantity(lossEntries), icon: ShieldAlert },
        { id: 'total-cost', label: 'Coût total des pertes', value: totalLossCostFormatted, icon: Euro },
    ];

    const monthlyLossRates = useMemo(() => calculateMonthlyLossRates(stockEntries, lossEntries), [lossEntries, stockEntries]);
    const lossCauseSummaries = useMemo(() => summarizeLossCauses(lossEntries), [lossEntries]);
    const averageProductionCosts = useMemo(() => calculateAverageProductionCosts(productionCostLots), [productionCostLots]);

    const handleDeleteLossEntry = (id: string) => {
        setLossEntries((prev) => prev.filter((item) => item.id !== id));
    };

    // Callback 1 : Soumission Déclarer un fromage impropre
    const handleDeclareImproperSubmit = async (data: DeclareFormData): Promise<boolean> => {
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
            setLossEntries((current) => [mapLossToLogEntry({
                ...saved,
                motif: saved.motif || motif,
            }), ...current]);
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
        const orderNum = currentOrder?.code || currentOrder?.id || orderId;
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
        <div className="relative space-y-5">
            {toastState && (
                <div className={`fixed bottom-6 right-6 z-[10000] flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 ${toastState.type === 'error' ? 'border-red-700 bg-red-600' : 'border-[#233a1e] bg-[#2d4a27]'}`}>
                    {toastState.type === 'error' ? <XCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
                    <span>{toastState.message}</span>
                </div>
            )}

            <header className="space-y-1">
                <div className="flex items-center gap-2"><TrendingDown className="size-5 text-red-600" /><h1 className="text-xl font-bold tracking-tight sm:text-2xl">Invendus & pertes</h1></div>
                <p className="text-sm text-stone-500">Retours d'invendus, fromages impropres à la vente, coût des pertes et taux de perte par fromage et par mois.</p>
            </header>

            <div className="space-y-5 pl-2 sm:pl-3 lg:pl-4">
            <Button variant="outline" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl border-stone-300 bg-white px-4 py-2 font-medium text-stone-700 shadow-sm transition-colors duration-200 hover:border-[#c84c28] hover:bg-[#c84c28] hover:text-white">
                <ShieldAlert className="size-4" />Déclarer un fromage impropre
            </Button>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">{kpiStats.map((stat) => {
                const Icon = stat.icon;
                return <Card key={stat.id} className="min-w-0 rounded-xl border-stone-200/80 bg-white/60 shadow-none"><CardContent className="space-y-1 p-2.5 sm:p-3"><div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-tight text-stone-600 sm:text-xs"><Icon className="size-3.5 shrink-0 text-stone-500" /><span>{stat.label}</span></div><div className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">{stat.value}</div></CardContent></Card>;
            })}</div>

            <DeclareImproperModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleDeclareImproperSubmit} />
            <RegisterReturnModal isOpen={selectedOrderForReturn !== null} order={selectedOrderForReturn} onClose={() => setSelectedOrderForReturn(null)} onSubmit={handleReturnSubmit} />

            <Tabs value={subTab} onValueChange={setSubTab} className="w-full space-y-5">
                <TabsList className="flex w-full justify-start gap-1 overflow-x-auto rounded-xl bg-[#EFECE6] p-1 sm:w-max">
                    {[
                        ['retours', "Retours d'invendus"],
                        ['journal', 'Journal des pertes'],
                        ['analyse', 'Analyse & taux'],
                        ['couts', 'Coûts de production'],
                    ].map(([value, label]) => <TabsTrigger key={value} value={value} className="shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-stone-600 transition-all data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm sm:text-sm">{label}</TabsTrigger>)}
                </TabsList>
                <TabsContent value="retours"><ReturnsTab orders={deliveredOrders} returns={orderReturns} onSelect={setSelectedOrderForReturn} /></TabsContent>
                <TabsContent value="journal"><LossJournalTab entries={lossEntries} onDelete={handleDeleteLossEntry} /></TabsContent>
                <TabsContent value="analyse"><LossAnalysisTab causes={lossCauseSummaries} rates={monthlyLossRates} /></TabsContent>
                <TabsContent value="couts"><ProductionCostsTab averages={averageProductionCosts} averagesLoading={productionCostLotsLoading} /></TabsContent>
            </Tabs>
            </div>
        </div>
    );
};
