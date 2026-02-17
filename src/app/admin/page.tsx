"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
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
  } from "lucide-react";

const CATEGORIES = [
  { value: "chiffon-hijabs", label: "Chiffon Hijabs" },
  { value: "satin-silk-hijabs", label: "Satin Silk Hijabs" },
  { value: "premium-jersey-wraps", label: "Premium Jersey Wraps" },
  { value: "everyday-essentials", label: "Everyday Essentials" },
  { value: "occasion-hijabs", label: "Occasion Hijabs" },
  { value: "accessories", label: "Accessories" },
];

const BADGES = [
  { value: "", label: "None" },
  { value: "New", label: "New" },
  { value: "Sale", label: "Sale" },
  { value: "Bestseller", label: "Bestseller" },
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
  category: string;
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
  category: CATEGORIES[0].value,
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
    category: product.category,
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

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/account/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user?.isAdmin) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <p className="text-[14px] text-[#757575]">Loading...</p>
        </main>
        <Footer />
      </>
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
      price: parseFloat(form.price),
      compareAt: form.compareAt ? parseFloat(form.compareAt) : undefined,
      image: form.image,
      hoverImage: form.hoverImage || form.image,
      badge: form.badge || undefined,
      description: form.description,
      details: form.details
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean),
      category: form.category,
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

  // Show the form view
  if (isAdding || editingProduct) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6]">
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
              {/* Basic Info */}
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

              {/* Pricing */}
              <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6">
                <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
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
              </div>

              {/* Images */}
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
                      </div>
                      {form.hoverImage && (
                        <div className="mt-2 w-20 h-20 relative rounded-lg overflow-hidden bg-[#F5F2ED]">
                          <Image src={form.hoverImage} alt="Hover preview" fill className="object-cover" sizes="80px" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              {/* Description */}
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
                </div>
              </div>

              {/* Actions */}
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
        </main>
        <Footer />
      </>
    );
  }

  // Product list view
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Admin Panel
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

          {/* Toolbar */}
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

          {/* Stats */}
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
                {products.filter((p) => p.badge === "Sale").length}
              </p>
              <p className="text-[12px] text-[#757575] uppercase tracking-wider">On Sale</p>
            </div>
          </div>

          {/* Product table */}
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
            <div className="hidden md:grid grid-cols-[auto_1fr_120px_100px_100px_100px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
              <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider w-14">Image</span>
              <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Product</span>
              <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Category</span>
              <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</span>
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
                  className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_120px_100px_100px_100px] gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 items-center hover:bg-[#FAFAF8] transition-colors"
                >
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
      </main>
      <Footer />
    </>
  );
}
