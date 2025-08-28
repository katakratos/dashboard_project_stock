"use client"
import Wrapper from '@/components/Wrapper'
import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { deleteProduct, readProducts } from '../../../action'
import EmptyState from '@/components/EmptyState'
import { Product } from '../../../type'

import ProductImage from '@/components/ProductImage'
import Link from 'next/link'
import { Trash } from 'lucide-react'
import { toast } from 'react-toastify'

const page = () => {

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = async () => {
    try {
      if(email) {
        const products = await readProducts(email);
        if(products) {
          setProducts(products);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if(email) {
      fetchProducts();
    }
  }, );

  const handleDeleteProduct = async (product: Product)  => {
    
    const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer ce produit ?");
    if(confirmDelete) return;
    try {
        if(product.imageUrl){
            const resDelete = await fetch("/api/upload",  {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({path: product.imageUrl})
            })
       
            const dataDelete = await resDelete.json()
            if(!dataDelete.success) {
                throw new Error("Erreur lors de la suppression de l'image du produit")
            } else {
                if(email){
                    await deleteProduct(product.id, email)
                    await fetchProducts()
                    toast.success("Produit supprimé avec succès")
                }
            }   
           
         }
         } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error);
    }
}
    
  return (
    <Wrapper>
        <div className='overflow-x-auto'>
            {products.length === 0 ? (
                <div>
                    <EmptyState
                        message='Aucun produit disponible'
                        IconComponent='PackageSearch'
                    />
                </div>
            ) : (
                <table className='table'>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Image</th>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Catégorie</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {products?.map((product, index) => (
                            <tr key={product.id}>
                                <th>{index +1 }</th>
                                <td>
                                    <ProductImage
                                        src={product.imageUrl}
                                        alt={product.imageUrl}
                                        heightClass='h-12'
                                        widthClass='w-12'/>
                                </td>
                                <td>
                                    {product.name}
                                </td>
                                <td>
                                     {product.description}
                                </td>
                                <td>
                                    {product.price} FCFA
                                </td>
                                <td className='capitalize'>
                                    {product.quantity} {product.unit}
                                </td>
                                <td>
                                     {product.categoryName}
                                </td>
                                <td>
                                    <div className='flex gap-2 felx-col'>
                                        <Link className='btn btn-xs w-fit btn-primary' href={`/update-product/${product.id}`}>
                                             Modifier
                                        </Link>
                    
                                        <button className='btn btn-sm  w-fit' onClick={() => handleDeleteProduct(product)}>
                                            <Trash className='w-4 h-4'/>
                                        </button>
                                    </div>
                                </td>    
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        }
        </div>
   </Wrapper>
  )
}

export default page