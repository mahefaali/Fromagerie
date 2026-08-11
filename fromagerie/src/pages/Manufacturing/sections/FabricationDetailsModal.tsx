import { Button } from "./../../../components/ui/button";
import { Modal } from "./../../../components/ui/modal";
import { LotDetails, type FabricationLot } from "./../../../components/ui/LotDetails";
import { type Fabrication } from "./../../../lib/production-store";
import { STATUS_META } from "./FabricationCard";

interface FabricationDetailsModalProps {
  fabrication: Fabrication | null;
  onClose: () => void;
}

export function FabricationDetailsModal({
  fabrication,
  onClose,
}: FabricationDetailsModalProps) {
  if (!fabrication) return null;

  const lotDetails: FabricationLot = {
    id: fabrication.id,
    name: fabrication.recipeName,
    description: fabrication.variant
      ? `${fabrication.recipeName} — ${fabrication.variant}`
      : fabrication.recipeName,
    provenance: fabrication.variant ? `Variante ${fabrication.variant}` : "Processus interne",
    price: "N/A",
    productType: fabrication.recipeName,
    operator: fabrication.operator,
    lotCode: fabrication.batchCode,
    startAt: `${fabrication.date}T08:00`,
    createdAt: new Date().toLocaleDateString("fr-FR"),
    status: "validé",
    stage: STATUS_META[fabrication.status].label,
    milkType: "N/A",
    milkQuantityL: String(fabrication.milkLiters),
    cheeseCount: fabrication.yieldPieces,
    milkTemperature: 0,
    milkOrigin: "N/A",
    temperature: fabrication.temperatureC,
    cookingTime: 0,
    coagulationTime: 0,
    curdCut: "N/A",
    rennetType: "N/A",
    rennetAmount: "0 ml",
    cultureType: "N/A",
    cultureAmount: "0 g",
    moldingType: "N/A",
    moldingTemperature: 0,
    drainageTime: 0,
    saltUsed: false,
    humidity: 0,
    observations: fabrication.notes ?? "Aucune observation",
    useStarter: false,
  };

  return (
    <Modal
      open={Boolean(fabrication)}
      onOpenChange={(open) => !open && onClose()}
      title={fabrication.recipeName}
      description={`Détails du lot ${fabrication.batchCode}`}
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      <LotDetails lot={lotDetails} />
    </Modal>
  );
}