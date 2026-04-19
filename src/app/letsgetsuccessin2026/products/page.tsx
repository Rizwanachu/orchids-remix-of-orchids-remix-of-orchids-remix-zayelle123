"use client";

import React, { useState, useEffect } from "react";
import { uploadFile } from "@/lib/direct-upload";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProducts } from "@/lib/products-context";
import { Product } from "@/lib/products";
import {
    Plus,
    Pencil,
    Trash2,
    Copy,
    X,
    Package,
    Search,
    ChevronLeft,
    ChevronDown,
    Save,
    ImageIcon,
    Upload,
    CheckSquare,
    Square,
    MinusSquare,
    ToggleLeft,
    FolderOpen,
    Settings,
    FileText,
    BookmarkPlus,
    GripVertical,
  } from "lucide-react";
import MediaPickerModal from "@/components/admin/media-picker-modal";
import ImageCropModal from "@/components/admin/image-crop-modal";

interface CategoryItem { id: number; name: string; value: string; displayOrder: number }
interface BadgeItem { id: number; name: string; value: string; color: string }
interface TemplateItem { id: number; name: string; description: string; details: string; dimension: string; material: string; careInstructions: string; shippingPolicy: string; returnPolicy: string }
interface ColorVariant { name: string; hex: string; image?: string }
interface SizeVariant { label: string; price?: number; compareAt?: number; outOfStock?: boolean }

interface ProductFormData {
  name: string;
  subtitle: string;
  handle: string;
  price: string;
  compareAt: string;
  image: string;
  hoverImage: string;
  gallery: string[];
  badge: string;
  description: string;
  details: string;
  dimension: string;
  material: string;
  careInstructions: string;
  colors: { name: string; hex: string; image?: string; images?: string[]; outOfStock?: boolean }[];
  colorSwatchStyle: "pills" | "dots" | "squares";
  sizes: SizeVariant[];
  bundlePricing: { quantity: string; price: string }[];
  deliveryCharges: { zones: { pincodes: string; charge: string }[] };
  category: string;
  stockQuantity: string;
  lowStockThreshold: string;
  shippingCost: string;
  shippingCostKerala: string;
  isFreeShipping: boolean;
  shippingPolicy: string;
  returnPolicy: string;
  customHamperEnabled: boolean;
  customHamperTitle: string;
  customHamperBody: string;
  customHamperInstagram: string;
  customHamperContact: string;
}

const emptyForm: ProductFormData = {
  name: "",
  subtitle: "",
  handle: "",
  price: "",
  compareAt: "",
  image: "",
  hoverImage: "",
  gallery: [],
  badge: "",
  description: "",
  details: "",
  dimension: "",
  material: "",
  careInstructions: "",
  colors: [],
  colorSwatchStyle: "pills",
  sizes: [],
  bundlePricing: [],
  deliveryCharges: { zones: [] },
  category: "",
  stockQuantity: "100",
  lowStockThreshold: "10",
  shippingCost: "49",
  shippingCostKerala: "49",
  isFreeShipping: false,
  shippingPolicy: "Free shipping on orders above Rs. 1000. Standard delivery within 5-7 business days across India.",
  returnPolicy: "Easy returns within 7 days of delivery. Product must be unused and in original packaging and need an unpacking video clearly showing the product is damaged (if you dont have unpacking video, dont have damaged products we cant do the returns).",
  customHamperEnabled: false,
  customHamperTitle: "Need a Custom Hamper?",
  customHamperBody: "Looking for a specific hijab color or a personalized hamper?\n\nDM us on Instagram or contact us through our Contact Page, and we'll help you create your perfect hamper.\n\nCustom hampers are one of our most requested gifts.",
  customHamperInstagram: "",
  customHamperContact: "",
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
    gallery: product.gallery || [],
    badge: product.badge || "",
    description: product.description,
    details: Array.isArray(product.details) ? product.details.join("\n") : (product.details as unknown as string) || "",
    dimension: (product as any).dimension || "",
    material: (product as any).material || "",
    careInstructions: (product as any).careInstructions || "",
    colors: (product as any).colors || [],
    colorSwatchStyle: (product as any).colorSwatchStyle || "pills",
    sizes: (product as any).sizes || [],
    bundlePricing: (() => {
      const bp = (product as any).bundlePricing;
      if (!bp || !Array.isArray(bp)) return [];
      return bp.map((b: any) => ({ quantity: String(b.quantity), price: String(b.price) }));
    })(),
    deliveryCharges: (() => {
      const dc = (product as any).deliveryCharges;
      if (!dc) return { zones: [] };
      return {
        zones: (dc.zones || []).map((z: any) => ({ pincodes: (z.pincodes || []).join(", "), charge: String(z.charge) })),
      };
    })(),
    category: product.category,
    stockQuantity: product.stockQuantity?.toString() ?? "100",
    lowStockThreshold: product.lowStockThreshold?.toString() ?? "10",
    shippingCost: (product as any).shippingCost?.toString() ?? "49",
    shippingCostKerala: (product as any).shippingCostKerala?.toString() ?? "49",
    isFreeShipping: (product as any).isFreeShipping ?? false,
    shippingPolicy: (product as any).shippingPolicy || "",
    returnPolicy: (product as any).returnPolicy || "",
    customHamperEnabled: !!((product as any).customHamperEnabled),
    customHamperTitle: (product as any).customHamperTitle || "Need a Custom Hamper?",
    customHamperBody: (product as any).customHamperBody || "",
    customHamperInstagram: (product as any).customHamperInstagram || "",
    customHamperContact: (product as any).customHamperContact || "",
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
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState<"image" | "hoverImage" | "gallery" | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState<"image" | "hoverImage" | "gallery" | null>(null);
  const [cropState, setCropState] = useState<{ file: File; onUpload: (file: File) => void } | null>(null);

  const [dragColorIdx, setDragColorIdx] = useState<number | null>(null);
  const [dragOverColorIdx, setDragOverColorIdx] = useState<number | null>(null);

  const [dynamicCategories, setDynamicCategories] = useState<CategoryItem[]>([]);
  const [dynamicBadges, setDynamicBadges] = useState<BadgeItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBadgeName, setNewBadgeName] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [newSizeLabel, setNewSizeLabel] = useState("");
  const [newSizePriceStr, setNewSizePriceStr] = useState("");
  const [newSizeCompareAtStr, setNewSizeCompareAtStr] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantHex, setNewVariantHex] = useState("#000000");
  const [newVariantImages, setNewVariantImages] = useState<string[]>([]);
  const [uploadingNewVariantSlot, setUploadingNewVariantSlot] = useState(false);
  const [saveVariantColor, setSaveVariantColor] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);
  const [savedColors, setSavedColors] = useState<{ name: string; hex: string }[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("zayelle_saved_colors") || "[]"); } catch { return []; }
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) { const data = await res.json(); setDynamicCategories(data); }
    } catch (e) { console.error("Failed to fetch categories:", e); }
  };

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/admin/badges");
      if (res.ok) { const data = await res.json(); setDynamicBadges(data); }
    } catch (e) { console.error("Failed to fetch badges:", e); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/product-templates");
      if (res.ok) { const data = await res.json(); setTemplates(data); }
    } catch (e) { console.error("Failed to fetch templates:", e); }
  };

  useEffect(() => {
    fetchCategories();
    fetchBadges();
    fetchTemplates();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const value = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), value }),
      });
      if (res.ok) { setNewCategoryName(""); await fetchCategories(); }
      else { const d = await res.json(); setErrorMessage(d.error || "Failed to add category"); setTimeout(() => setErrorMessage(""), 3000); }
    } catch { setErrorMessage("Failed to add category"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleUpdateCategory = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cat.name, value: cat.value }),
      });
      if (res.ok) { setEditingCategory(null); await fetchCategories(); }
    } catch { setErrorMessage("Failed to update category"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) await fetchCategories();
    } catch { setErrorMessage("Failed to delete category"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleAddBadge = async () => {
    if (!newBadgeName.trim()) return;
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBadgeName.trim(), value: newBadgeName.trim(), color: newBadgeColor }),
      });
      if (res.ok) { setNewBadgeName(""); setNewBadgeColor(""); await fetchBadges(); }
      else { const d = await res.json(); setErrorMessage(d.error || "Failed to add badge"); setTimeout(() => setErrorMessage(""), 3000); }
    } catch { setErrorMessage("Failed to add badge"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleUpdateBadge = async (badge: BadgeItem) => {
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: badge.name, value: badge.value, color: badge.color }),
      });
      if (res.ok) { setEditingBadge(null); await fetchBadges(); }
    } catch { setErrorMessage("Failed to update badge"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/badges/${id}`, { method: "DELETE" });
      if (res.ok) await fetchBadges();
    } catch { setErrorMessage("Failed to delete badge"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const persistSavedColors = (colors: { name: string; hex: string }[]) => {
    localStorage.setItem("zayelle_saved_colors", JSON.stringify(colors));
    setSavedColors(colors);
  };

  const handleSaveColor = (name: string, hex: string) => {
    const already = savedColors.some(c => c.hex.toLowerCase() === hex.toLowerCase());
    if (already) return;
    persistSavedColors([...savedColors, { name, hex }]);
  };

  const handleDeleteSavedColor = (hex: string) => {
    persistSavedColors(savedColors.filter(c => c.hex.toLowerCase() !== hex.toLowerCase()));
  };

  const getColorImages = (c: { image?: string; images?: string[] }) =>
    c.images && c.images.length > 0 ? c.images : c.image ? [c.image] : [];

  const addVariant = () => {
    const name = newVariantName.trim();
    if (!name) return;
    setForm(prev => ({ ...prev, colors: [...prev.colors, { name, hex: newVariantHex, ...(newVariantImages.length > 0 ? { images: newVariantImages } : {}) }] }));
    if (saveVariantColor) handleSaveColor(name, newVariantHex);
    setNewVariantName("");
    setNewVariantHex("#000000");
    setNewVariantImages([]);
    setSaveVariantColor(false);
  };

  const uploadNewVariantImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (newVariantImages.length >= 3) return;
    const file = e.target.files?.[0];
    if (!file) { return; }
    e.target.value = "";
    setCropState({
      file,
      onUpload: async (croppedFile) => {
        setUploadingNewVariantSlot(true);
        try {
          const url = await uploadFile(croppedFile);
          setNewVariantImages(prev => [...prev, url].slice(0, 3));
        } catch { setErrorMessage("Failed to upload image"); setTimeout(() => setErrorMessage(""), 3000); }
        finally { setUploadingNewVariantSlot(false); }
      },
    });
  };

  const removeVariant = (idx: number) => {
    setForm(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  };

  const uploadVariantImage = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCropState({
      file,
      onUpload: async (croppedFile) => {
        setUploadingVariantIdx(idx);
        try {
          const url = await uploadFile(croppedFile);
          setForm(prev => ({
            ...prev,
            colors: prev.colors.map((c, i) => {
              if (i !== idx) return c;
              const existing = getColorImages(c);
              return { ...c, images: [...existing, url].slice(0, 3), image: undefined };
            }),
          }));
        } catch { setErrorMessage("Failed to upload variant image"); setTimeout(() => setErrorMessage(""), 3000); }
        finally { setUploadingVariantIdx(null); }
      },
    });
  };

  const removeVariantImage = (variantIdx: number, imgIdx: number) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => {
        if (i !== variantIdx) return c;
        const imgs = getColorImages(c).filter((_, j) => j !== imgIdx);
        return { ...c, images: imgs, image: undefined };
      }),
    }));
  };

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const template = templates.find(t => t.id.toString() === templateId);
    if (!template) return;
    setForm(prev => ({
      ...prev,
      description: template.description || prev.description,
      details: template.details || prev.details,
      dimension: template.dimension || prev.dimension,
      material: template.material || prev.material,
      careInstructions: template.careInstructions || prev.careInstructions,
      shippingPolicy: template.shippingPolicy || prev.shippingPolicy,
      returnPolicy: template.returnPolicy || prev.returnPolicy,
    }));
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;
    setSavingTemplate(true);
    try {
      const body = {
        name: newTemplateName.trim(),
        description: form.description,
        details: form.details,
        dimension: form.dimension,
        material: form.material,
        careInstructions: form.careInstructions,
        shippingPolicy: form.shippingPolicy,
        returnPolicy: form.returnPolicy,
      };
      const res = await fetch("/api/admin/product-templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNewTemplateName(""); setShowSaveTemplate(false); await fetchTemplates();
        showSuccess("Template saved successfully");
      } else {
        const d = await res.json(); setErrorMessage(d.error || "Failed to save template"); setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch { setErrorMessage("Failed to save template"); setTimeout(() => setErrorMessage(""), 3000); }
    setSavingTemplate(false);
  };

  const handleUpdateTemplate = async (template: TemplateItem) => {
    try {
      const res = await fetch(`/api/admin/product-templates/${template.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          details: template.details,
          dimension: template.dimension,
          material: template.material,
          careInstructions: template.careInstructions,
          shippingPolicy: template.shippingPolicy,
          returnPolicy: template.returnPolicy,
        }),
      });
      if (res.ok) { setEditingTemplate(null); await fetchTemplates(); showSuccess("Template updated"); }
    } catch { setErrorMessage("Failed to update template"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/product-templates/${id}`, { method: "DELETE" });
      if (res.ok) { await fetchTemplates(); showSuccess("Template deleted"); }
    } catch { setErrorMessage("Failed to delete template"); setTimeout(() => setErrorMessage(""), 3000); }
  };

  const handleImageUpload = async (file: File, field: "image" | "hoverImage" | "gallery") => {
    setUploadingImage(field);
    try {
      const url = await uploadFile(file);
      if (field === "gallery") {
        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
      } else {
        updateField(field, url);
      }
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to upload image. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setUploadingImage(null);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Only redirect if no user at all, but middleware should handle this too
        // router.push("/letsgetsuccessin2026/login");
      } else if (!user.isAdmin) {
        router.push("/");
      }
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

  const handleSave = async () => {
    const missing: string[] = [];
    if (!form.name) missing.push("Product Name");
    if (!form.price) missing.push("Price");
    if (!form.image) missing.push("Main Image");
    if (!form.description) missing.push("Description");
    if (missing.length > 0) {
      setErrorMessage(`Please fill in the required fields: ${missing.join(", ")}`);
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const handle = form.handle || generateHandle(form.name);
    const productData = {
      handle,
      name: form.name,
      subtitle: form.subtitle,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : null,
      image: form.image,
      hoverImage: form.hoverImage || form.image,
      badge: form.badge || undefined,
      description: form.description,
      details: form.details
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      dimension: form.dimension,
      material: form.material,
      careInstructions: form.careInstructions,
      shippingPolicy: form.shippingPolicy,
      returnPolicy: form.returnPolicy,
      category: form.category,
      stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : 100,
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 10,
      shippingCost: Number(form.shippingCost),
      shippingCostKerala: Number(form.shippingCostKerala),
      isFreeShipping: form.isFreeShipping,
      colors: form.colors,
      colorSwatchStyle: form.colorSwatchStyle,
      sizes: form.sizes,
      bundlePricing: (() => {
        const valid = form.bundlePricing.filter(b => b.quantity !== "" && b.price !== "");
        return valid.length > 0 ? valid.map(b => ({ quantity: Number(b.quantity), price: Number(b.price) })) : [];
      })(),
      deliveryCharges: (() => {
        const validZones = form.deliveryCharges.zones.filter(z => z.pincodes.trim() && z.charge !== "");
        if (validZones.length === 0) return null;
        return {
          zones: validZones.map(z => ({
            pincodes: z.pincodes.split(",").map(p => p.trim()).filter(Boolean),
            charge: Number(z.charge),
          })),
        };
      })(),
      gallery: form.gallery,
      customHamperEnabled: form.customHamperEnabled ? 1 : 0,
      customHamperTitle: form.customHamperTitle,
      customHamperBody: form.customHamperBody,
      customHamperInstagram: form.customHamperInstagram,
      customHamperContact: form.customHamperContact,
    };

    try {
      if (isAdding) {
        await addProduct(productData);
        showSuccess("Product added successfully");
      } else if (editingProduct) {
        await updateProduct(editingProduct, productData);
        showSuccess("Product updated successfully");
      }
      handleCancel();
    } catch (error: any) {
      console.error("Save failed:", error);
      setErrorMessage(error.message || "Failed to save product. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
      showSuccess("Product deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product. Please check the console for details.");
    }
  };

  const handleDuplicate = async (product: Product) => {
    setDuplicatingId(product.id);
    try {
      const suffix = Date.now().toString().slice(-5);
      const productData = {
        handle: `${product.handle}-copy-${suffix}`,
        name: `${product.name} (Copy)`,
        subtitle: (product as any).subtitle || "",
        price: product.price,
        compareAt: (product as any).compareAt || undefined,
        image: product.image,
        hoverImage: (product as any).hoverImage || product.image,
        badge: product.badge || undefined,
        description: (product as any).description || "",
        details: (product as any).details || [],
        dimension: (product as any).dimension || "",
        material: (product as any).material || "",
        careInstructions: (product as any).careInstructions || "",
        category: product.category,
        stockQuantity: (product as any).stockQuantity ?? 100,
        lowStockThreshold: (product as any).lowStockThreshold ?? 10,
        shippingCost: (product as any).shippingCost ?? 0,
        shippingCostKerala: (product as any).shippingCostKerala ?? 0,
        isFreeShipping: (product as any).isFreeShipping ?? false,
        colors: (product as any).colors || [],
        gallery: (product as any).gallery || [],
        customHamperEnabled: (product as any).customHamperEnabled ?? false,
        customHamperTitle: (product as any).customHamperTitle || "",
        customHamperBody: (product as any).customHamperBody || "",
        customHamperInstagram: (product as any).customHamperInstagram || "",
        customHamperContact: (product as any).customHamperContact || "",
      };
      await addProduct(productData);
      showSuccess(`"${product.name}" duplicated successfully`);
    } catch (error) {
      console.error("Duplicate failed:", error);
      setErrorMessage("Failed to duplicate product.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setDuplicatingId(null);
    }
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
      <>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                      Category
                    </label>
                    <button type="button" onClick={() => setShowCategoryManager(!showCategoryManager)} className="text-[11px] text-[#5C4B3D] hover:underline flex items-center gap-1">
                      <Settings size={11} /> Manage
                    </button>
                  </div>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    <option value="">Select Category</option>
                    {dynamicCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showCategoryManager && (
                <div className="mt-4 pt-4 border-t border-[#F5F2ED]">
                  <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-3">Manage Categories</h3>
                  <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                    {dynamicCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2 bg-[#FAFAF8] px-3 py-2 rounded-sm">
                        {editingCategory?.id === cat.id ? (
                          <>
                            <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="flex-1 h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                            <button onClick={() => handleUpdateCategory(editingCategory)} className="text-[11px] text-[#5C4B3D] hover:underline">Save</button>
                            <button onClick={() => setEditingCategory(null)} className="text-[11px] text-[#757575] hover:underline">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-[13px] text-[#1A1A1A]">{cat.name}</span>
                            <button onClick={() => setEditingCategory(cat)} className="text-[#757575] hover:text-[#5C4B3D]"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-[#757575] hover:text-red-500"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} placeholder="New category name" className="flex-1 h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                    <button onClick={handleAddCategory} className="h-[36px] px-4 bg-[#5C4B3D] text-white rounded-sm text-[12px] hover:bg-[#4A3C31]">Add</button>
                  </div>
                </div>
              )}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                      Badge
                    </label>
                    <button type="button" onClick={() => setShowBadgeManager(!showBadgeManager)} className="text-[11px] text-[#5C4B3D] hover:underline flex items-center gap-1">
                      <Settings size={11} /> Manage
                    </button>
                  </div>
                  <select
                    value={form.badge}
                    onChange={(e) => updateField("badge", e.target.value)}
                    className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    <option value="">None</option>
                    {dynamicBadges.map((badge) => (
                      <option key={badge.value} value={badge.value}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showBadgeManager && (
                <div className="mt-4 pt-4 border-t border-[#F5F2ED]">
                  <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-3">Manage Badges</h3>
                  <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                    {dynamicBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-2 bg-[#FAFAF8] px-3 py-2 rounded-sm">
                        {editingBadge?.id === badge.id ? (
                          <>
                            <input type="text" value={editingBadge.name} onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value, value: e.target.value })} className="flex-1 h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                            <input type="text" value={editingBadge.color} onChange={(e) => setEditingBadge({ ...editingBadge, color: e.target.value })} placeholder="Color (optional)" className="w-[100px] h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                            <button onClick={() => handleUpdateBadge(editingBadge)} className="text-[11px] text-[#5C4B3D] hover:underline">Save</button>
                            <button onClick={() => setEditingBadge(null)} className="text-[11px] text-[#757575] hover:underline">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-[13px] text-[#1A1A1A]">{badge.name}</span>
                            {badge.color && <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: badge.color }} />}
                            <button onClick={() => setEditingBadge(badge)} className="text-[#757575] hover:text-[#5C4B3D]"><Pencil size={12} /></button>
                            <button onClick={() => handleDeleteBadge(badge.id)} className="text-[#757575] hover:text-red-500"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newBadgeName} onChange={(e) => setNewBadgeName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddBadge()} placeholder="New badge name" className="flex-1 h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                    <input type="text" value={newBadgeColor} onChange={(e) => setNewBadgeColor(e.target.value)} placeholder="Color (optional)" className="w-[120px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" />
                    <button onClick={handleAddBadge} className="h-[36px] px-4 bg-[#5C4B3D] text-white rounded-sm text-[12px] hover:bg-[#4A3C31]">Add</button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#F5F2ED]">
                <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-1">Product Color Variants</h3>
                <p className="text-[12px] text-[#999] mb-3">Add color options with images so customers can see each color on the product page.</p>

                <div className="mb-4">
                  <p className="text-[12px] font-medium text-[#1A1A1A] mb-2">Swatch Display Style</p>
                  <div className="flex gap-2">
                    {([
                      { value: "pills", label: "Pills", desc: "● Name" },
                      { value: "dots", label: "Dots", desc: "●●●" },
                      { value: "squares", label: "Squares", desc: "■■■" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, colorSwatchStyle: opt.value }))}
                        className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-md border-2 transition-all text-[12px] font-medium ${
                          form.colorSwatchStyle === opt.value
                            ? "border-[#5C4B3D] bg-[#5C4B3D]/5 text-[#5C4B3D]"
                            : "border-[#E8E4DE] text-[#757575] hover:border-[#5C4B3D]"
                        }`}
                      >
                        <span className="text-[15px] tracking-widest">{opt.desc}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {savedColors.length > 0 && (
                  <div className="mb-4 p-3 bg-[#FAFAF8] border border-[#E8E4DE] rounded-md">
                    <p className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider mb-2">Saved Colors — click to select</p>
                    <div className="flex flex-wrap gap-2">
                      {savedColors.map((sc) => (
                        <div key={sc.hex} className="relative group">
                          <button
                            type="button"
                            onClick={() => { setNewVariantHex(sc.hex); setNewVariantName(sc.name); }}
                            title={`${sc.name} (${sc.hex})`}
                            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 border border-[#E8E4DE] rounded-full bg-white hover:border-[#5C4B3D] transition-colors text-left"
                          >
                            <span className="w-5 h-5 rounded-full border border-white shadow-sm flex-shrink-0" style={{ backgroundColor: sc.hex }} />
                            <span className="text-[12px] text-[#1A1A1A] font-medium leading-none">{sc.name}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedColor(sc.hex)}
                            title="Remove from saved"
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.colors.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {form.colors.map((color, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDragColorIdx(idx)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverColorIdx(idx); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragColorIdx === null || dragColorIdx === idx) return;
                          setForm(prev => {
                            const next = [...prev.colors];
                            const [moved] = next.splice(dragColorIdx, 1);
                            next.splice(idx, 0, moved);
                            return { ...prev, colors: next };
                          });
                          setDragColorIdx(null);
                          setDragOverColorIdx(null);
                        }}
                        onDragEnd={() => { setDragColorIdx(null); setDragOverColorIdx(null); }}
                        className={`flex flex-col gap-2 bg-[#FAFAF8] border rounded-md px-3 py-2.5 transition-all select-none ${
                          dragColorIdx === idx
                            ? "opacity-40 border-[#5C4B3D] border-dashed"
                            : dragOverColorIdx === idx
                            ? "border-[#5C4B3D] bg-[#5C4B3D]/5 shadow-sm"
                            : "border-[#E8E4DE]"
                        }`}
                      >
                        {/* Row 1: drag handle + swatch + name + OOS + delete */}
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-[#C4B9B0] flex-shrink-0 cursor-grab active:cursor-grabbing" />
                          <span className="w-7 h-7 rounded-full border-2 border-white shadow flex-shrink-0" style={{ backgroundColor: color.hex }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{color.name}</p>
                            <p className="text-[11px] text-[#999] font-mono">{color.hex}</p>
                          </div>
                          <button
                            type="button"
                            title={color.outOfStock ? "Mark as In Stock" : "Mark as Out of Stock"}
                            onClick={() => setForm(prev => ({
                              ...prev,
                              colors: prev.colors.map((c, i) => i === idx ? { ...c, outOfStock: !c.outOfStock } : c)
                            }))}
                            className={`text-[11px] px-2 py-1 rounded border flex-shrink-0 transition-colors ${
                              color.outOfStock
                                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                : "border-[#E8E4DE] text-[#999] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                            }`}
                          >
                            {color.outOfStock ? "OOS" : "In Stock"}
                          </button>
                          <button type="button" onClick={() => removeVariant(idx)} className="text-[#999] hover:text-red-500 transition-colors flex-shrink-0">
                            <X size={15} />
                          </button>
                        </div>
                        {/* Row 2: images + save color (indented under swatch) */}
                        <div className="flex items-center gap-2 flex-wrap pl-9">
                          {!savedColors.some(sc => sc.hex.toLowerCase() === color.hex.toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => handleSaveColor(color.name, color.hex)}
                              title="Save this color for future use"
                              className="text-[11px] text-[#5C4B3D] hover:underline flex-shrink-0 whitespace-nowrap"
                            >
                              Save color
                            </button>
                          )}
                          {(() => {
                            const imgs = getColorImages(color);
                            return (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {imgs.map((src, imgIdx) => (
                                  <div key={imgIdx} className="relative group/img flex-shrink-0">
                                    <img src={src} alt={`${color.name} ${imgIdx + 1}`} className="w-10 h-10 object-cover rounded-md border border-[#E8E4DE]" />
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(idx, imgIdx)}
                                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity leading-none"
                                    >×</button>
                                  </div>
                                ))}
                                {imgs.length < 3 && (
                                  <label className={`flex items-center gap-1 text-[11px] px-2 py-1.5 border border-[#E8E4DE] rounded-sm cursor-pointer hover:border-[#5C4B3D] hover:text-[#5C4B3D] transition-colors flex-shrink-0 ${uploadingVariantIdx === idx ? "opacity-50 pointer-events-none text-[#999]" : "text-[#757575]"}`}>
                                    <Upload size={11} />
                                    {uploadingVariantIdx === idx ? "…" : imgs.length === 0 ? "Add image" : "+"}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadVariantImage(e, idx)} disabled={uploadingVariantIdx === idx} />
                                  </label>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 items-center bg-[#FAFAF8] border border-dashed border-[#D4C8BE] rounded-md px-3 py-2.5">
                  <input
                    type="color"
                    value={newVariantHex}
                    onChange={(e) => setNewVariantHex(e.target.value)}
                    className="w-9 h-9 rounded-md border border-[#E8E4DE] cursor-pointer p-0.5 bg-white flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={newVariantHex}
                    onChange={(e) => setNewVariantHex(e.target.value)}
                    placeholder="#000000"
                    className="w-[88px] h-[36px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white font-mono flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addVariant()}
                    placeholder="Color name (e.g. Dusty Rose)"
                    className="flex-1 min-w-[140px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white"
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {newVariantImages.map((src, i) => (
                      <div key={i} className="relative group/nimg flex-shrink-0">
                        <img src={src} alt={`img ${i + 1}`} className="w-9 h-9 object-cover rounded-md border border-[#E8E4DE]" />
                        <button
                          type="button"
                          onClick={() => setNewVariantImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover/nimg:opacity-100 transition-opacity leading-none"
                        >×</button>
                      </div>
                    ))}
                    {newVariantImages.length < 3 && (
                      <label className={`flex items-center gap-1 text-[12px] px-2.5 py-1.5 border border-[#E8E4DE] rounded-sm cursor-pointer hover:border-[#5C4B3D] hover:text-[#5C4B3D] transition-colors flex-shrink-0 ${uploadingNewVariantSlot ? "opacity-50 pointer-events-none text-[#999]" : "text-[#757575]"}`}>
                        <Upload size={12} />
                        {uploadingNewVariantSlot ? "…" : newVariantImages.length === 0 ? "Image" : "+"}
                        <input type="file" accept="image/*" className="hidden" onChange={uploadNewVariantImage} disabled={uploadingNewVariantSlot} />
                      </label>
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 select-none">
                    <input
                      type="checkbox"
                      checked={saveVariantColor}
                      onChange={(e) => setSaveVariantColor(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#E8E4DE] text-[#5C4B3D] focus:ring-[#5C4B3D]"
                    />
                    <span className="text-[12px] text-[#757575]">Save color</span>
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!newVariantName.trim() || uploadingNewVariantSlot}
                    className="h-[36px] px-4 bg-[#5C4B3D] text-white rounded-sm text-[12px] hover:bg-[#4A3C31] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </div>

              {/* ── Size Variants ── */}
              <div className="pt-4 border-t border-[#F5F2ED]">
                <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-1">Product Size Variants <span className="text-[11px] font-normal text-[#999]">(optional)</span></h3>
                <p className="text-[12px] text-[#999] mb-3">Add sizes like XS, S, M, L, XL, XXL or custom ones like 3ml, 6ml, 9ml.</p>

                {/* Preset buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((preset) => {
                    const already = form.sizes.some(s => s.label === preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!already) setForm(prev => ({ ...prev, sizes: [...prev.sizes, { label: preset }] }));
                        }}
                        className={`px-3 py-1.5 rounded-sm border text-[12px] font-medium transition-colors ${
                          already
                            ? "border-[#5C4B3D] bg-[#5C4B3D]/10 text-[#5C4B3D] cursor-default"
                            : "border-[#E8E4DE] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] cursor-pointer"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>

                {/* Current sizes list — row layout with price */}
                {form.sizes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.sizes.map((size, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-[12px] transition-colors ${
                          size.outOfStock ? "border-red-200 bg-red-50" : "border-[#E8E4DE] bg-[#FAFAF8]"
                        }`}
                      >
                        {/* Label */}
                        <span className={`font-semibold w-10 flex-shrink-0 ${size.outOfStock ? "text-red-400 line-through" : "text-[#1A1A1A]"}`}>
                          {size.label}
                        </span>
                        {/* Price input */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[11px] text-[#999]">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={size.price ?? ""}
                            onChange={(e) => setForm(prev => ({
                              ...prev,
                              sizes: prev.sizes.map((s, i) => i === idx
                                ? { ...s, price: e.target.value !== "" ? Number(e.target.value) : undefined }
                                : s
                              )
                            }))}
                            placeholder="Price"
                            className="w-[80px] h-[28px] px-2 border border-[#E8E4DE] rounded-sm text-[12px] bg-white"
                          />
                        </div>
                        {/* Compare-at price input */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[11px] text-[#bbb] line-through">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={size.compareAt ?? ""}
                            onChange={(e) => setForm(prev => ({
                              ...prev,
                              sizes: prev.sizes.map((s, i) => i === idx
                                ? { ...s, compareAt: e.target.value !== "" ? Number(e.target.value) : undefined }
                                : s
                              )
                            }))}
                            placeholder="Compare"
                            className="w-[80px] h-[28px] px-2 border border-[#E8E4DE] rounded-sm text-[12px] bg-white text-[#999]"
                          />
                        </div>
                        {/* OOS toggle */}
                        <button
                          type="button"
                          title={size.outOfStock ? "Mark as In Stock" : "Mark as Out of Stock"}
                          onClick={() => setForm(prev => ({ ...prev, sizes: prev.sizes.map((s, i) => i === idx ? { ...s, outOfStock: !s.outOfStock } : s) }))}
                          className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 transition-colors ${
                            size.outOfStock
                              ? "bg-red-100 border-red-300 text-red-600 hover:bg-red-50"
                              : "border-[#E8E4DE] text-[#999] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                          }`}
                        >
                          {size.outOfStock ? "OOS" : "In Stock"}
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }))}
                          className="text-[#C4B9B0] hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add custom size */}
                <div className="flex flex-wrap gap-2 items-center bg-[#FAFAF8] border border-dashed border-[#D4C8BE] rounded-md px-3 py-2.5">
                  <input
                    type="text"
                    value={newSizeLabel}
                    onChange={(e) => setNewSizeLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSizeLabel.trim()) {
                        const price = newSizePriceStr !== "" ? Number(newSizePriceStr) : undefined;
                        const compareAt = newSizeCompareAtStr !== "" ? Number(newSizeCompareAtStr) : undefined;
                        setForm(prev => ({ ...prev, sizes: [...prev.sizes, { label: newSizeLabel.trim(), ...(price !== undefined ? { price } : {}), ...(compareAt !== undefined ? { compareAt } : {}) }] }));
                        setNewSizeLabel(""); setNewSizePriceStr(""); setNewSizeCompareAtStr("");
                      }
                    }}
                    placeholder="Size label (e.g. 3ml, One Size)"
                    className="flex-1 min-w-[120px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[12px] text-[#999]">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={newSizePriceStr}
                      onChange={(e) => setNewSizePriceStr(e.target.value)}
                      placeholder="Price"
                      className="w-[90px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[12px] text-[#bbb] line-through">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={newSizeCompareAtStr}
                      onChange={(e) => setNewSizeCompareAtStr(e.target.value)}
                      placeholder="Compare"
                      className="w-[90px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white text-[#999]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSizeLabel.trim()) return;
                      const price = newSizePriceStr !== "" ? Number(newSizePriceStr) : undefined;
                      const compareAt = newSizeCompareAtStr !== "" ? Number(newSizeCompareAtStr) : undefined;
                      setForm(prev => ({ ...prev, sizes: [...prev.sizes, { label: newSizeLabel.trim(), ...(price !== undefined ? { price } : {}), ...(compareAt !== undefined ? { compareAt } : {}) }] }));
                      setNewSizeLabel(""); setNewSizePriceStr(""); setNewSizeCompareAtStr("");
                    }}
                    disabled={!newSizeLabel.trim()}
                    className="h-[36px] px-4 bg-[#5C4B3D] text-white rounded-sm text-[12px] hover:bg-[#4A3C31] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Add
                  </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                          Within Kerala (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.shippingCostKerala}
                          onChange={(e) => updateField("shippingCostKerala", e.target.value)}
                          className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                          placeholder="49"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                          Outside Kerala (Rs.)
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bundle Offers */}
            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">Bundle Offers</h2>
              <p className="text-[12px] text-[#999] mb-4">Optional — offer discounted pricing when customers buy multiple units (e.g. Buy 2 for ₹499).</p>

              {form.bundlePricing.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.bundlePricing.map((bundle, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[12px] text-[#999] whitespace-nowrap">Buy</span>
                        <input
                          type="number"
                          min="1"
                          value={bundle.quantity}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            bundlePricing: prev.bundlePricing.map((b, i) => i === bIdx ? { ...b, quantity: e.target.value } : b)
                          }))}
                          placeholder="Qty"
                          className="w-[70px] h-[36px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white focus:outline-none focus:border-[#5C4B3D] text-center"
                        />
                        <span className="text-[12px] text-[#999] whitespace-nowrap">for ₹</span>
                        <input
                          type="number"
                          min="0"
                          value={bundle.price}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            bundlePricing: prev.bundlePricing.map((b, i) => i === bIdx ? { ...b, price: e.target.value } : b)
                          }))}
                          placeholder="Price"
                          className="w-[100px] h-[36px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white focus:outline-none focus:border-[#5C4B3D]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, bundlePricing: prev.bundlePricing.filter((_, i) => i !== bIdx) }))}
                        className="h-[36px] w-[36px] flex items-center justify-center text-[#C4B9B0] hover:text-red-500 border border-[#E8E4DE] rounded-sm transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, bundlePricing: [...prev.bundlePricing, { quantity: "", price: "" }] }))}
                className="flex items-center gap-1.5 text-[13px] text-[#5C4B3D] border border-[#5C4B3D] rounded-sm px-3 h-[36px] hover:bg-[#F5F2ED] transition-colors"
              >
                <Plus size={13} /> Add Offer
              </button>
            </div>

            {/* Delivery Charges by Pincode */}
            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">Delivery Charges by Pincode</h2>
              <p className="text-[12px] text-[#999] mb-4">Optional — set specific delivery charges for certain pincodes. Unmatched pincodes will use the Kerala/outside Kerala rates above.</p>

              {/* Zones */}
              {form.deliveryCharges.zones.length > 0 && (
                <div className="space-y-3 mb-3">
                  {form.deliveryCharges.zones.map((zone, zIdx) => (
                    <div key={zIdx} className="flex flex-col sm:flex-row gap-2 p-3 bg-[#FAFAF8] border border-[#E8E4DE] rounded-md">
                      <div className="flex-1 min-w-0">
                        <label className="block text-[11px] text-[#999] mb-1">Pincodes (comma-separated)</label>
                        <input
                          type="text"
                          value={zone.pincodes}
                          onChange={(e) => setForm(prev => ({
                            ...prev,
                            deliveryCharges: {
                              ...prev.deliveryCharges,
                              zones: prev.deliveryCharges.zones.map((z, i) => i === zIdx ? { ...z, pincodes: e.target.value } : z)
                            }
                          }))}
                          placeholder="600001, 600002, 682001"
                          className="w-full h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white focus:outline-none focus:border-[#5C4B3D]"
                        />
                      </div>
                      <div className="flex items-end gap-2 flex-shrink-0">
                        <div>
                          <label className="block text-[11px] text-[#999] mb-1">Charge (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={zone.charge}
                            onChange={(e) => setForm(prev => ({
                              ...prev,
                              deliveryCharges: {
                                ...prev.deliveryCharges,
                                zones: prev.deliveryCharges.zones.map((z, i) => i === zIdx ? { ...z, charge: e.target.value } : z)
                              }
                            }))}
                            placeholder="₹"
                            className="w-[90px] h-[36px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white focus:outline-none focus:border-[#5C4B3D]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, deliveryCharges: { ...prev.deliveryCharges, zones: prev.deliveryCharges.zones.filter((_, i) => i !== zIdx) } }))}
                          className="h-[36px] w-[36px] flex items-center justify-center text-[#C4B9B0] hover:text-red-500 border border-[#E8E4DE] rounded-sm transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, deliveryCharges: { ...prev.deliveryCharges, zones: [...prev.deliveryCharges.zones, { pincodes: "", charge: "" }] } }))}
                className="flex items-center gap-1.5 text-[13px] text-[#5C4B3D] border border-[#5C4B3D] rounded-sm px-3 h-[36px] hover:bg-[#F5F2ED] transition-colors"
              >
                <Plus size={13} /> Add Zone
              </button>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <FileText size={18} className="text-[#5C4B3D]" />
                  Load Template
                </h2>
                <button type="button" onClick={() => setShowTemplateManager(!showTemplateManager)} className="text-[11px] text-[#5C4B3D] hover:underline flex items-center gap-1">
                  <Settings size={11} /> Manage Templates
                </button>
              </div>
              <p className="text-[12px] text-[#757575] mb-3">Select a saved template to auto-fill product details, description, and specifications.</p>
              <select
                value={selectedTemplate}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
              >
                <option value="">-- No Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id.toString()}>{t.name}</option>
                ))}
              </select>

              {showTemplateManager && (
                <div className="mt-4 pt-4 border-t border-[#F5F2ED]">
                  <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-3">Saved Templates</h3>
                  {templates.length === 0 ? (
                    <p className="text-[13px] text-[#757575]">No templates saved yet. Fill in the product details below and use &quot;Save as Template&quot; to create one.</p>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {templates.map((t) => (
                        <div key={t.id} className="bg-[#FAFAF8] px-3 py-2 rounded-sm">
                          {editingTemplate?.id === t.id ? (
                            <div className="space-y-2">
                              <input type="text" value={editingTemplate.name} onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} className="w-full h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] bg-white" placeholder="Template name" />
                              <textarea value={editingTemplate.description} onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })} className="w-full h-[60px] px-2 py-1 border border-[#E8E4DE] rounded-sm text-[12px] bg-white resize-none" placeholder="Description" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editingTemplate.dimension} onChange={(e) => setEditingTemplate({ ...editingTemplate, dimension: e.target.value })} className="h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[12px] bg-white" placeholder="Dimension" />
                                <input type="text" value={editingTemplate.material} onChange={(e) => setEditingTemplate({ ...editingTemplate, material: e.target.value })} className="h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[12px] bg-white" placeholder="Material" />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleUpdateTemplate(editingTemplate)} className="text-[11px] text-[#5C4B3D] hover:underline">Save</button>
                                <button onClick={() => setEditingTemplate(null)} className="text-[11px] text-[#757575] hover:underline">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <span className="text-[13px] font-medium text-[#1A1A1A]">{t.name}</span>
                                {t.material && <span className="text-[11px] text-[#757575] ml-2">{t.material}</span>}
                                {t.dimension && <span className="text-[11px] text-[#757575] ml-1">| {t.dimension}</span>}
                              </div>
                              <button onClick={() => handleApplyTemplate(t.id.toString())} className="text-[11px] text-[#5C4B3D] hover:underline">Apply</button>
                              <button onClick={() => setEditingTemplate(t)} className="text-[#757575] hover:text-[#5C4B3D]"><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteTemplate(t.id)} className="text-[#757575] hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Product Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                    Care Instructions (one per line)
                  </label>
                  <textarea
                    value={form.careInstructions}
                    onChange={(e) => updateField("careInstructions", e.target.value)}
                    className="w-full h-[100px] px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y font-mono"
                    placeholder={"Hand wash recommended\nUse mild detergent\nDo not bleach\nSteam iron only"}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, customHamperEnabled: !prev.customHamperEnabled }))}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAF8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-5 rounded-full transition-colors ${form.customHamperEnabled ? "bg-[#5C4B3D]" : "bg-[#D1C7C0]"} relative flex-shrink-0`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.customHamperEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#1A1A1A]">Custom Hamper Section</p>
                    <p className="text-[12px] text-[#757575]">Show a &ldquo;Need a Custom Hamper?&rdquo; accordion on this product page</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-[#757575] transition-transform flex-shrink-0 ${form.customHamperEnabled ? "rotate-180" : ""}`} />
              </button>

              {form.customHamperEnabled && (
                <div className="px-6 pb-6 border-t border-[#F5F2ED] space-y-4 pt-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                      Accordion Title
                    </label>
                    <input
                      type="text"
                      value={form.customHamperTitle}
                      onChange={(e) => updateField("customHamperTitle", e.target.value)}
                      className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="Need a Custom Hamper?"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                      Body Text
                    </label>
                    <textarea
                      value={form.customHamperBody}
                      onChange={(e) => updateField("customHamperBody", e.target.value)}
                      className="w-full h-[120px] px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-y"
                      placeholder="Looking for a specific hijab color or a personalized hamper?&#10;&#10;DM us on Instagram or contact us through our Contact Page..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                        Instagram Link URL
                      </label>
                      <input
                        type="text"
                        value={form.customHamperInstagram}
                        onChange={(e) => updateField("customHamperInstagram", e.target.value)}
                        className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                        placeholder="https://instagram.com/zayelle"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                        Contact Page Link URL
                      </label>
                      <input
                        type="text"
                        value={form.customHamperContact}
                        onChange={(e) => updateField("customHamperContact", e.target.value)}
                        className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                        placeholder="https://zayelle.in/contact"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Inventory</h2>
              <div className="mb-4 flex items-center justify-between p-3 bg-[#FAFAF8] border border-[#E8E4DE] rounded-md">
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A1A]">Out of Stock</p>
                  <p className="text-[11px] text-[#757575] mt-0.5">Customers will see "Out of Stock" and cannot purchase</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("stockQuantity", Number(form.stockQuantity) === 0 ? "100" : "0")}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${Number(form.stockQuantity) === 0 ? "bg-red-500" : "bg-[#E8E4DE]"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${Number(form.stockQuantity) === 0 ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
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
                    <label className={`flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] cursor-pointer transition-colors bg-white flex-shrink-0 ${uploadingImage === "image" ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload size={14} />
                      {uploadingImage === "image" ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage === "image"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCropState({ file, onUpload: (f) => handleImageUpload(f, "image") });
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
                    <label className={`flex items-center gap-1.5 h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] cursor-pointer transition-colors bg-white flex-shrink-0 ${uploadingImage === "hoverImage" ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload size={14} />
                      {uploadingImage === "hoverImage" ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage === "hoverImage"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCropState({ file, onUpload: (f) => handleImageUpload(f, "hoverImage") });
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

              <div className="mt-6 pt-6 border-t border-[#F5F2ED]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[14px] font-medium text-[#1A1A1A]">Gallery Images</h3>
                    <p className="text-[11px] text-[#757575] mt-0.5">Add additional images for the product gallery (minimum 3 recommended)</p>
                  </div>
                  <span className="text-[12px] text-[#757575]">{form.gallery.length} image{form.gallery.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.gallery.map((url, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden bg-[#F5F2ED] border border-[#E8E4DE]">
                      <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" sizes="96px" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                  <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-[#E8E4DE] hover:border-[#5C4B3D] flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingImage === "gallery" ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingImage === "gallery" ? (
                      <span className="text-[11px] text-[#757575]">Uploading...</span>
                    ) : (
                      <>
                        <Plus size={20} className="text-[#757575]" />
                        <span className="text-[10px] text-[#757575] mt-1">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage === "gallery"}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCropState({ file, onUpload: (f) => handleImageUpload(f, "gallery") });
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker("gallery")}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-[#E8E4DE] hover:border-[#5C4B3D] flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <ImageIcon size={20} className="text-[#757575]" />
                    <span className="text-[10px] text-[#757575] mt-1">Browse</span>
                  </button>
                </div>
                {form.gallery.length < 3 && form.gallery.length > 0 && (
                  <p className="text-[11px] text-amber-600">Add at least {3 - form.gallery.length} more image{3 - form.gallery.length > 1 ? "s" : ""} for a complete gallery</p>
                )}
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

              <div className="mt-4 pt-4 border-t border-[#F5F2ED]">
                {showSaveTemplate ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                      placeholder="Enter template name (e.g. Chiffon Hijab Default)"
                      className="flex-1 h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] bg-white focus:outline-none focus:border-[#5C4B3D]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate || !newTemplateName.trim()}
                      className="h-[38px] px-4 bg-[#5C4B3D] text-white rounded-sm text-[12px] font-medium hover:bg-[#4A3C31] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Save size={13} />
                      {savingTemplate ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setShowSaveTemplate(false); setNewTemplateName(""); }} className="h-[38px] px-3 text-[12px] text-[#757575] hover:text-[#1A1A1A] border border-[#E8E4DE] rounded-sm">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSaveTemplate(true)}
                    className="flex items-center gap-2 text-[13px] text-[#5C4B3D] hover:text-[#4A3C31] font-medium"
                  >
                    <BookmarkPlus size={15} />
                    Save current details as template
                  </button>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-[13px] text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage !== null}
                className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? "Saving..." : isAdding ? "Add Product" : "Save Changes"}
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
      <MediaPickerModal
        open={showMediaPicker !== null}
        onClose={() => setShowMediaPicker(null)}
        onSelect={(url) => {
          if (showMediaPicker === "gallery") {
            setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
          } else if (showMediaPicker) {
            updateField(showMediaPicker, url);
          }
        }}
      />
      {cropState && (
        <ImageCropModal
          file={cropState.file}
          onConfirm={(croppedFile) => {
            const { onUpload } = cropState;
            setCropState(null);
            onUpload(croppedFile);
          }}
          onCancel={() => setCropState(null)}
        />
      )}
      </>
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
                    {dynamicCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => handleBulkSetCategory(cat.value)}
                        disabled={bulkLoading}
                        className="w-full text-left px-3 py-2 text-[12px] text-[#1A1A1A] hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                      >
                        {cat.name}
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
                  <button
                    onClick={() => handleDuplicate(product)}
                    disabled={duplicatingId === product.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Duplicate product"
                  >
                    {duplicatingId === product.id
                      ? <span className="w-3.5 h-3.5 border-2 border-[#5C4B3D] border-t-transparent rounded-full animate-spin" />
                      : <Copy size={14} />
                    }
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
          if (showMediaPicker === "gallery") {
            setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
          } else if (showMediaPicker) {
            updateField(showMediaPicker, url);
          }
        }}
      />
      {cropState && (
        <ImageCropModal
          file={cropState.file}
          onConfirm={(croppedFile) => {
            const { onUpload } = cropState;
            setCropState(null);
            onUpload(croppedFile);
          }}
          onCancel={() => setCropState(null)}
        />
      )}
    </div>
  );
}
