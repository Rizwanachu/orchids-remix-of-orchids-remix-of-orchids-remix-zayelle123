"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProducts } from "@/lib/products-context";
import { Product } from "@/lib/products";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Package,
    Search,
    ChevronLeft,
    Save,
    ImageIcon,
    Upload,
    CheckSquare,
    Square,
    MinusSquare,
    ToggleLeft,
    FolderOpen,
  } from "lucide-react";
import MediaPickerModal from "@/components/admin/media-picker-modal";

const CATEGORIES = [
  { value: "chiffon-hijabs", label: "Chiffon Hijabs" },
  { value: "satin-silk-hijabs", label: "Satin Silk Hijabs" },
  { value: "premium-jersey-wraps", label: "Premium Jersey Wraps" },
  { value: "everyday-essentials", label: "Everyday Essentials" },
  { value: "occasion-hijabs", label: "Occasion Hijabs" },
  { value: "accessories", label: "Accessories" },
  { value: "gift-hampers", label: "Gift Hampers" },
];

const BADGES = [
  { value: "", label: "None" },
  { value: "New", label: "New" },
  { value: "Sale", label: "Sale" },
  { value: "Bestseller", label: "Bestseller" },
  { value: "Gift", label: "Gift" },
];

interface ProductFormData {
  name: string;
  subtitle: string;
  handle: string;
  price: string;
  compareAt: string;
  image: string;
  hoverImage: string;
  badge: string;
  description: string;
  details: string;
  shippingPolicy: string;
  returnPolicy: string;
  category: string;
  stockQuantity: string;
  lowStockThreshold: string;
  shippingCost: string;
  isFreeShipping: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  subtitle: "",
  handle: "",
  price: "",
  compareAt: "",
  image: "",
  hoverImage: "",
  badge: "",
  description: "",
  details: "",
  shippingPolicy: "",
  returnPolicy: "",
  category: CATEGORIES[0].value,
  stockQuantity: "100",
  lowStockThreshold: "10",
  shippingCost: "49",
  isFreeShipping: false,
};

function toFormData(product: Product): ProductFormData {
  return {
    name: product.name,
    subtitle: product.subtitle,
    handle: product.handle,
    price: product.price.toString(),
    compareAt: product.compareAt?.toString() || "",
    image: product.image,
    hoverImage: product.hoverImage,
    badge: product.badge || "",
    description: product.description,
    details: product.details.join("\n"),
    shippingPolicy: product.shippingPolicy || "",
    returnPolicy: product.returnPolicy || "",
    category: product.category,
    stockQuantity: product.stockQuantity?.toString() ?? "100",
    lowStockThreshold: product.lowStockThreshold?.toString() ?? "10",
    shippingCost: (product as any).shippingCost?.toString() ?? "49",
    isFreeShipping: (product as any).isFreeShipping ?? false,
  };
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminProductsPage() {
  const { user, isLoading } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState<"image" | "hoverImage" | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/account/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[14px] text-[#757575]">Loading...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product.id);
    setForm(toFormData(product));
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.image || !form.description) return;

    const handle = form.handle || generateHandle(form.name);
    const productData = {
      handle,
      name: form.name,
      subtitle: form.subtitle,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : undefined,
      image: form.image,
      hoverImage: form.hoverImage || form.image,
      badge: form.badge || undefined,
      description: form.description,
      details: form.details
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      shippingPolicy: form.shippingPolicy,
      returnPolicy: form.returnPolicy,
      category: form.category,
      stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : 100,
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 10,
      shippingCost: Number(form.shippingCost),
      isFreeShipping: form.isFreeShipping,
    };

    if (isAdding) {
      addProduct(productData);
      showSuccess("Product added successfully");
    } else if (editingProduct) {
      updateProduct(editingProduct, productData);
      showSuccess("Product updated successfully");
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    showSuccess("Product deleted successfully");
  };

  const updateField = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && (isAdding || !prev.handle)) {
        updated.handle = generateHandle(value);
      }
      return updated;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        await refreshProducts();
        setSelectedIds(new Set());
        showSuccess(`Deleted ${selectedIds.size} products`);
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
    setBulkDeleteConfirm(false);
    setBulkLoading(false);
  };

  const handleBulkSetCategory = async (category: string) => {
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_category", ids: Array.from(selectedIds), category }),
      });
      if (res.ok) {
        await refreshProducts();
        setSelectedIds(new Set());
        showSuccess(`Updated category for ${selectedIds.size} products`);
      }
    } catch (error) {
      console.error("Bulk set category failed:", error);
    }
    setBulkCategoryOpen(false);
    setBulkLoading(false);
  };

  const handleBulkToggleActive = async () => {
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active", ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        await refreshProducts();
        setSelectedIds(new Set());
        showSuccess(`Toggled active status for ${selectedIds.size} products`);
      }
    } catch (error) {
      console.error("Bulk toggle active failed:", error);
    }
    setBulkLoading(false);
  };

  if (isAdding || editingProduct) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-8">
          <div className="container px-4 md:px-8 max-w-[900px] mx-auto">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-[13px] text-[#757575] hover:text-[#1A1A1A] transition-colors mb-3"
            >
              <ChevronLeft size={14} /> Back to products
            </button>
            <h1 className="text-[28px] font-serif text-[#1A1A1A]">
              {isAdding ? "Add New Product" : "Edit Product"}
            </h1>
          </div>
        </div>

        <div className="container px-4 md:px-8 max-w-[900px] mx-auto py-8">
          <div className="space-y-6">
            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="e.g. The Noor Chiffon Hijab"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="e.g. Soft matte chiffon"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    URL Handle
                  </label>
                  <input
                    type="text"
                    value={form.handle}
                    onChange={(e) => updateField("handle", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white text-[#757575]"
                    placeholder="auto-generated-from-name"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Pricing & Shipping</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="899"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Compare At Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.compareAt}
                    onChange={(e) => updateField("compareAt", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="1199"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Badge
                  </label>
                  <select
                    value={form.badge}
                    onChange={(e) => updateField("badge", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    {BADGES.map((badge) => (
                      <option key={badge.value} value={badge.value}>
                        {badge.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F5F2ED]">
                <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-3">Shipping Options</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => setForm(prev => ({ ...prev, isFreeShipping: !prev.isFreeShipping }))}
                      className="transition-colors"
                    >
                      {form.isFreeShipping ? (
                        <CheckSquare size={20} className="text-[#5C4B3D]" />
                      ) : (
                        <Square size={20} className="text-[#E8E4DE] group-hover:border-[#5C4B3D]" />
                      )}
                    </div>
                    <span className="text-[14px] text-[#1A1A1A]">Offer Free Shipping for this product</span>
                  </label>

                  {!form.isFreeShipping && (
                    <div className="max-w-[200px]">
                      <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                        Delivery Charge (Rs.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.shippingCost}
                        onChange={(e) => updateField("shippingCost", e.target.value)}
                        className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                        placeholder="49"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => updateField("stockQuantity", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => updateField("lowStockThreshold", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    placeholder="10"
                  />
                  <p className="mt-1 text-[11px] text-[#757575]">You&apos;ll see a warning when stock falls below this number</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Main Image *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => updateField("image", e.target.value)}
                      className="flex-1 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="Paste URL or upload file"
                    />
                    <label className="flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] cursor-pointer transition-colors bg-white flex-shrink-0">
                      <Upload size={14} />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateField("image", reader.result as string);
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker("image")}
                      className="flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors bg-white flex-shrink-0"
                    >
                      <ImageIcon size={14} />
                      Browse
                    </button>
                  </div>
                  {form.image && (
                    <div className="mt-2 w-20 h-20 relative rounded-lg overflow-hidden bg-[#F5F2ED]">
                      <Image src={form.image} alt="Preview" fill className="object-cover" sizes="80px" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Hover Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.hoverImage}
                      onChange={(e) => updateField("hoverImage", e.target.value)}
                      className="flex-1 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="Paste URL or upload file"
                    />
                    <label className="flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] cursor-pointer transition-colors bg-white flex-shrink-0">
                      <Upload size={14} />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateField("hoverImage", reader.result as string);
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker("hoverImage")}
                      className="flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors bg-white flex-shrink-0"
                    >
                      <ImageIcon size={14} />
                      Browse
                    </button>
                  </div>
                  {form.hoverImage && (
                    <div className="mt-2 w-20 h-20 relative rounded-lg overflow-hidden bg-[#F5F2ED]">
                      <Image src={form.hoverImage} alt="Hover preview" fill className="object-cover" sizes="80px" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Description & Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y"
                    placeholder="Describe this product..."
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Product Details (one per line)
                  </label>
                  <textarea
                    value={form.details}
                    onChange={(e) => updateField("details", e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y font-mono"
                    placeholder={"Material: Premium Chiffon\nSize: 180cm x 70cm\nCare: Hand wash cold"}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Shipping Policy
                  </label>
                  <textarea
                    value={form.shippingPolicy}
                    onChange={(e) => updateField("shippingPolicy", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y"
                    placeholder="e.g. Free shipping on orders above Rs. 1950. Standard delivery within 5-7 business days across India."
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Return Policy
                  </label>
                  <textarea
                    value={form.returnPolicy}
                    onChange={(e) => updateField("returnPolicy", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y"
                    placeholder="e.g. Easy returns within 7 days of delivery. Product must be unused and in original packaging."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price || !form.image || !form.description}
                className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {isAdding ? "Add Product" : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 border border-[#E8E4DE] text-[#757575] px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Products
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage your product catalog
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-sm text-[13px] text-green-700 flex items-center gap-2">
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-[320px]">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] pl-10 pr-4 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          </div>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors flex-shrink-0"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-6 p-4 bg-[#F5F2ED] border border-[#E8E4DE] rounded-[12px] flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[#1A1A1A]">
              {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {bulkDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-sm px-3 py-1.5">
                  <span className="text-[12px] text-red-700">Delete {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""}?</span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                    className="px-3 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {bulkLoading ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setBulkDeleteConfirm(false)}
                    className="px-2 py-1 text-[11px] text-[#757575] hover:text-[#1A1A1A] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-600 border border-red-200 rounded-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete Selected
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setBulkCategoryOpen(!bulkCategoryOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#5C4B3D] border border-[#E8E4DE] rounded-sm hover:bg-white transition-colors"
                >
                  <FolderOpen size={13} />
                  Set Category
                </button>
                {bulkCategoryOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-[#E8E4DE] rounded-[8px] shadow-lg z-10 min-w-[180px] py-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleBulkSetCategory(cat.value)}
                        disabled={bulkLoading}
                        className="w-full text-left px-3 py-2 text-[12px] text-[#1A1A1A] hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleBulkToggleActive}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#5C4B3D] border border-[#E8E4DE] rounded-sm hover:bg-white transition-colors disabled:opacity-50"
              >
                <ToggleLeft size={13} />
                Toggle Active
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1 px-2 py-1.5 text-[12px] text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                <X size={13} />
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-4">
            <p className="text-[24px] font-semibold text-[#1A1A1A]">{products.length}</p>
            <p className="text-[12px] text-[#757575] uppercase tracking-wider">Total Products</p>
          </div>
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-4">
            <p className="text-[24px] font-semibold text-[#1A1A1A]">
              {new Set(products.map((p) => p.category)).size}
            </p>
            <p className="text-[12px] text-[#757575] uppercase tracking-wider">Categories</p>
          </div>
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-4">
            <p className="text-[24px] font-semibold text-[#1A1A1A]">
              {products.filter((p) => p.badge === "New").length}
            </p>
            <p className="text-[12px] text-[#757575] uppercase tracking-wider">New Arrivals</p>
          </div>
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-4">
            <p className="text-[24px] font-semibold text-[#1A1A1A]">
              {products.filter((p) => {
                const qty = p.stockQuantity ?? 100;
                const threshold = p.lowStockThreshold ?? 10;
                return qty <= threshold;
              }).length}
            </p>
            <p className="text-[12px] text-[#757575] uppercase tracking-wider">Low / Out of Stock</p>
          </div>
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[32px_auto_1fr_120px_100px_100px_100px_100px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8] items-center">
            <button onClick={toggleSelectAll} className="flex items-center justify-center text-[#757575] hover:text-[#5C4B3D] transition-colors">
              {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                <CheckSquare size={16} />
              ) : selectedIds.size > 0 ? (
                <MinusSquare size={16} />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider w-14">Image</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Product</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Category</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Stock</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Badge</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider text-right">Actions</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[32px_auto_1fr_120px_100px_100px_100px_100px] gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 items-center hover:bg-[#FAFAF8] transition-colors ${selectedIds.has(product.id) ? "bg-[#F5F2ED]/50" : ""}`}
              >
                <button
                  onClick={() => toggleSelect(product.id)}
                  className="hidden md:flex items-center justify-center text-[#757575] hover:text-[#5C4B3D] transition-colors"
                >
                  {selectedIds.has(product.id) ? <CheckSquare size={16} className="text-[#5C4B3D]" /> : <Square size={16} />}
                </button>
                <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-[#D4C8BE]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#1A1A1A] truncate">{product.name}</p>
                  <p className="text-[12px] text-[#757575] truncate">{product.subtitle}</p>
                </div>
                <p className="hidden md:block text-[12px] text-[#757575] capitalize">
                  {product.category.replace(/-/g, " ")}
                </p>
                <p className="hidden md:block text-[13px] font-semibold text-[#1A1A1A]">
                  Rs. {product.price.toLocaleString("en-IN")}
                </p>
                <div className="hidden md:block">
                  {(() => {
                    const qty = product.stockQuantity ?? 100;
                    const threshold = product.lowStockThreshold ?? 10;
                    if (qty === 0) {
                      return (
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      );
                    }
                    if (qty <= threshold) {
                      return (
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full bg-amber-50 text-amber-700">
                          Low Stock ({qty})
                        </span>
                      );
                    }
                    return (
                      <span className="text-[12px] text-[#757575]">{qty}</span>
                    );
                  })()}
                </div>
                <div className="hidden md:block">
                  {product.badge && (
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full ${
                        product.badge === "Sale"
                          ? "bg-red-50 text-red-700"
                          : product.badge === "New"
                          ? "bg-[#F5F2ED] text-[#5C4B3D]"
                          : "bg-[#F5F2ED] text-[#1A1A1A]"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => handleStartEdit(product)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                    title="Edit product"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === product.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <MediaPickerModal
        open={showMediaPicker !== null}
        onClose={() => setShowMediaPicker(null)}
        onSelect={(url) => {
          if (showMediaPicker) updateField(showMediaPicker, url);
        }}
      />
    </div>
  );
}
