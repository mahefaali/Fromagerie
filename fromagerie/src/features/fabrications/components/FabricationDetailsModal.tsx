import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import { fabricationApi } from "../api/fabricationApi";
import type { FabricationDetail } from "../types/fabrication.types";
import { FabricationDetails } from "./FabricationDetails";

interface FabricationDetailsModalProps {
  fabricationId: number | null;
  onClose: () => void;
}

export function FabricationDetailsModal({ fabricationId, onClose }: FabricationDetailsModalProps) {
  const [fabrication, setFabrication] = useState<FabricationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (fabricationId === null) {
      setFabrication(null);
      setError(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    fabricationApi.findById(fabricationId)
      .then((detail) => {
        if (active) setFabrication(detail);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Chargement impossible.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fabricationId, retryKey]);

  return (
    <Modal
      open={fabricationId !== null}
      onOpenChange={(open) => !open && onClose()}
      title={fabrication ? `Lot ${fabrication.numeroLot}` : "Détail de la fabrication"}
      description={fabrication ? `${fabrication.fromageNom} · ${fabrication.recetteNom}` : undefined}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div role="status" className="p-10 text-center text-sm text-muted-foreground">
          Chargement du détail...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <p className="font-medium">Impossible de charger cette fabrication.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={() => setRetryKey((key) => key + 1)}>
            <RefreshCw className="size-4" /> Réessayer
          </Button>
        </div>
      ) : fabrication ? (
        <FabricationDetails fabrication={fabrication} />
      ) : null}
    </Modal>
  );
}
