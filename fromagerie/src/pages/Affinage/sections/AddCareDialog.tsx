import { useState, useEffect, useRef } from "react";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./../../../components/ui/dialog";

// Interface étendue avec le champ images (URLs/DataURLs)
export interface CareData {
  type: string;
  notes: string;
  date?: string;
  operator?: string;
  rindState?: string;
  images?: string[];
}

export interface AddCareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCare: (careData: CareData) => void;
}

export function AddCareDialog({
  open,
  onOpenChange,
  onSubmitCare,
}: AddCareDialogProps) {
  const [typeSoin, setTypeSoin] = useState("Retournement");
  const [date, setDate] = useState("");
  const [operateur, setOperateur] = useState("");
  const [etatCroute, setEtatCroute] = useState("");
  const [observations, setObservations] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Réinitialisation des champs à l'ouverture
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setTypeSoin("Retournement");
      setOperateur("");
      setEtatCroute("");
      setObservations("");
      setImages([]);
    }
  }, [open]);

  // Gestion du chargement des photos en DataURL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset l'input pour pouvoir ré-uploader le même fichier si besoin
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSubmitCare({
      type: typeSoin,
      notes: observations.trim(),
      date,
      operator: operateur.trim(),
      rindState: etatCroute.trim(),
      images,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-[#FCFAF7] p-6 text-foreground border-none shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-bold text-foreground">
            Ajouter un soin
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enregistrez un retournement, un lavage ou une observation de croûte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Type de soin */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Type de soin</Label>
            <Select value={typeSoin} onValueChange={setTypeSoin}>
              <SelectTrigger className="h-11 rounded-xl border-border bg-white/60">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Retournement">Retournement</SelectItem>
                <SelectItem value="Lavage">Lavage / Frottage</SelectItem>
                <SelectItem value="Brossage">Brossage</SelectItem>
                <SelectItem value="Observation">Observation croûte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Opérateur */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="care-date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="care-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border-border bg-white/60 pr-8"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="care-op" className="text-sm font-medium">
                Opérateur
              </Label>
              <Input
                id="care-op"
                placeholder="Nom de l'opérateur"
                value={operateur}
                onChange={(e) => setOperateur(e.target.value)}
                className="h-11 rounded-xl border-border bg-white/60 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* État de croûte (optionnel) */}
          <div className="space-y-1.5">
            <Label htmlFor="care-croute" className="text-sm font-medium">
              État de croûte <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <Input
              id="care-croute"
              placeholder="Ex : fleur blanche régulière, humide, tachée..."
              value={etatCroute}
              onChange={(e) => setEtatCroute(e.target.value)}
              className="h-11 rounded-xl border-border bg-white/60 placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Input Photos optionnel */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Photos du fromage <span className="text-muted-foreground font-normal">(optionnel)</span></span>
            </Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Prévisualisation des images */}
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((imgSrc, idx) => (
                <div key={idx} className="relative size-16 rounded-xl overflow-hidden border border-black/10 group">
                  <img src={imgSrc} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-16 border-dashed border-border bg-white/40 rounded-xl flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:bg-white/80 px-4"
              >
                <Camera className="size-4 text-muted-foreground" />
                <span>Ajouter</span>
              </Button>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <Label htmlFor="care-obs" className="text-sm font-medium">
              Observations
            </Label>
            <Textarea
              id="care-obs"
              rows={3}
              placeholder="Notes, remarques particulières..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="rounded-xl border-border bg-white/60 placeholder:text-muted-foreground/60 resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <DialogFooter className="flex items-center justify-end gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl px-4 text-foreground hover:bg-black/5"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl bg-[#2A481B] px-6 text-white hover:bg-[#203714]"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}