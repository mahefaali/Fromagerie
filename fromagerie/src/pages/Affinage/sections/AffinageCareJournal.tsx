import { useState } from "react";
import {
  RotateCw,
  Droplets,
  Eye,
  Brush,
  User,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "./../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./../../../components/ui/dialog";

export interface CareSummary {
  lastFlip: string;
  lastWashing: string;
  rindState: string;
}

export interface CareLogEntry {
  id: string;
  type: string;
  date: string;
  operator?: string;
  rindState?: string;
  notes?: string;
  images?: string[];
}

interface AffinageCareJournalProps {
  summary: CareSummary;
  logs?: CareLogEntry[];
  onDeleteLog?: (id: string) => void;
}

function getCareIcon(type: string) {
  switch (type) {
    case "Retournement":
      return <RotateCw className="size-3 text-foreground/80" />;
    case "Lavage":
    case "Lavage / Frottage":
      return <Droplets className="size-3 text-foreground/80" />;
    case "Brossage":
      return <Brush className="size-3 text-foreground/80" />;
    case "Observation":
    case "Observation croûte":
      return <Eye className="size-3 text-foreground/80" />;
    default:
      return <RotateCw className="size-3 text-foreground/80" />;
  }
}

export function AffinageCareJournal({
  summary,
  logs = [],
  onDeleteLog,
}: AffinageCareJournalProps) {
  // État pour gérer la photo actuellement affichée en grand format
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-[#F5F0E6] p-6 text-foreground space-y-6">
      <h3 className="text-xl font-bold text-foreground">Journal de soins</h3>

      {/* Cartes de résumé en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dernier Retournement */}
        <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-[#ECE6D8]/60 p-3.5">
          <RotateCw className="size-4 text-muted-foreground shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              DERNIER RETOURNEMENT
            </p>
            <p className="text-sm font-semibold">{summary.lastFlip}</p>
          </div>
        </div>

        {/* Dernier Lavage */}
        <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-[#ECE6D8]/60 p-3.5">
          <Droplets className="size-4 text-muted-foreground shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              DERNIER LAVAGE
            </p>
            <p className="text-sm font-semibold">{summary.lastWashing}</p>
          </div>
        </div>

        {/* État de croûte */}
        <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-[#ECE6D8]/60 p-3.5">
          <Eye className="size-4 text-muted-foreground shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              ÉTAT DE CROÛTE
            </p>
            <p className="text-sm font-semibold truncate max-w-[160px]">
              {summary.rindState}
            </p>
          </div>
        </div>
      </div>

      {/* Liste/Timeline des cartes de soins */}
      {logs.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-[1px] before:bg-black/10">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              {/* Puce / Icône sur la ligne temporelle */}
              <div className="absolute -left-6 top-3.5 -translate-x-1/2 flex items-center justify-center size-6 rounded-full bg-white text-foreground border border-black/10 shadow-sm">
                {getCareIcon(log.type)}
              </div>

              {/* Carte de soin */}
              <div className="rounded-2xl border border-black/5 bg-[#ECE6D8]/60 p-4 space-y-2.5">
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#DCE8D6] text-[#2A481B]">
                      {log.type}
                    </span>
                    <span className="text-sm text-muted-foreground/80 font-normal">
                      {log.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground/80">
                    {log.operator && (
                      <span className="flex items-center gap-1.5 text-sm font-normal">
                        <User className="size-4 text-muted-foreground/70" />
                        {log.operator}
                      </span>
                    )}
                    {onDeleteLog && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteLog(log.id)}
                        className="size-7 text-muted-foreground/70 hover:text-destructive hover:bg-transparent -mr-1"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contenu du soin */}
                <div className="space-y-2 pt-0.5">
                  {log.rindState && (
                    <p className="text-sm text-muted-foreground">
                      Croûte : <span className="text-foreground/90 font-medium">{log.rindState}</span>
                    </p>
                  )}
                  {log.notes && (
                    <p className="text-base text-foreground font-normal">
                      {log.notes}
                    </p>
                  )}

                  {/* Galerie de photos miniatures */}
                  {log.images && log.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {log.images.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => setSelectedImage(imgUrl)}
                          className="relative group size-20 rounded-xl overflow-hidden border border-black/10 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A481B]"
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo du soin ${imgIdx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                          {/* Overlay de survol avec l'icône loupe */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="size-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-black/10 rounded-xl">
          Aucun soin enregistré pour le moment.
        </div>
      )}

      {/* Modale d'affichage de la photo en Grand Format */}
      <Dialog
        open={Boolean(selectedImage)}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-2 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">Photo du fromage</DialogTitle>
          {selectedImage && (
            <div className="relative max-h-[85vh] max-w-full rounded-2xl overflow-hidden bg-black/90 shadow-2xl flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Photo grand format"
                className="max-h-[85vh] w-auto max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 size-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}