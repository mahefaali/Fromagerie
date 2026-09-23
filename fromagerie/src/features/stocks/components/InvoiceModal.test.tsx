import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "../types/orders";
import { InvoiceModal } from "./InvoiceModal";

afterEach(cleanup);

const order: Order = {
  id: "42",
  code: "CMD-42",
  clientName: "Épicerie du village",
  status: "delivered",
  expectedDeliveryDate: "2026-09-30",
  items: [{ id: "1", name: "Tomme", quantity: 5, deliveredQuantity: 3, unit: "u", pricePerUnit: 10, gap: -2 }],
};

describe("InvoiceModal", () => {
  it("calcule le montant livré et valide le mode de paiement", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<InvoiceModal isOpen order={order} onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByRole("dialog", { name: "Facture — CMD-42" })).toBeInTheDocument();
    expect(screen.getAllByText("30.00 €")).toHaveLength(2);
    await user.selectOptions(screen.getByRole("combobox", { name: "Mode de paiement" }), "Carte bancaire");
    await user.click(screen.getByRole("button", { name: "Valider la facture" }));

    expect(onSubmit).toHaveBeenCalledWith({ orderId: "42", paymentMethod: "Carte bancaire" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("affiche une facture existante sans permettre une nouvelle validation", async () => {
    const user = userEvent.setup();
    const invoicedOrder = { ...order, invoiceNumber: "FAC-42", invoicedDate: "2026-10-01", invoicedTotal: 28 };
    const onSubmit = vi.fn();
    const onDownloadPdf = vi.fn();
    render(<InvoiceModal isOpen order={invoicedOrder} onClose={vi.fn()} onSubmit={onSubmit} onDownloadPdf={onDownloadPdf} />);

    expect(screen.getByRole("dialog", { name: "Facture FAC-42" })).toBeInTheDocument();
    expect(screen.getByText("28.00 €")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Valider la facture" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Mode de paiement" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Télécharger le PDF" }));
    expect(onDownloadPdf).toHaveBeenCalledWith(invoicedOrder);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("fusionne les lignes d'un même fromage et conserve le total", () => {
    const groupedOrder: Order = {
      ...order,
      items: [
        { id: "lot-1", name: "Tomme", quantity: 2, deliveredQuantity: 2, unit: "u", pricePerUnit: 8 },
        { id: "lot-2", name: "Tomme", quantity: 3, deliveredQuantity: 3, unit: "u", pricePerUnit: 10 },
      ],
    };

    render(<InvoiceModal isOpen order={groupedOrder} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByText(/Tomme · 5 u × 9\.20 €/)).toBeInTheDocument();
    expect(screen.getByText("Prévu : 5 u · livré : 5 u")).toBeInTheDocument();
    expect(screen.getAllByText("46.00 €")).toHaveLength(2);
    expect(screen.queryByText(/lot-1|lot-2/i)).not.toBeInTheDocument();
  });
});
