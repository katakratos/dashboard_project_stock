"use client"
import CategoryModal from '@/components/CategoryModal'
import Wrapper from '@/components/Wrapper'
import React, { useEffect }  from 'react'
import { useState } from 'react'
import { createCategory, deleteCategory, readCategory, updateCategory } from '../../../action'
import { toast } from 'react-toastify'
import { useUser } from '@clerk/nextjs'
import { Category } from '@prisma/client'
import EmptyState from '@/components/EmptyState'
import { Pencil, Trash } from 'lucide-react'

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  // State variables for category creation
  // These will be used to manage the form inputs for creating a new category
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [name, setName] = useState("")
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [description, setDescription] = useState("")
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [editMode, setEditMode] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [editingCategoryId,  setEditingCategoryId] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [categories, setCategories] = useState<Category[]>([])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadCategories = async () => {
    if(email) {
      const data = await readCategory(email)
      if(data) {
        setCategories(data)
      }
    }
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    loadCategories()
  }, [email]);
  
  
  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById('category_modal') as HTMLDialogElement)?.showModal()
  };

  const closeModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById('category_modal') as HTMLDialogElement)?.close()
  };

  const handleCreateCategory = async () => {
    setLoading(true);
    if(email){
      await createCategory(name, email, description)
    }
    await loadCategories()
     // Reset the form and close the modal after successful creation
     setName("");
     setDescription("");
     setEditMode(false);
     setEditingCategoryId(null);
    closeModal()
    setLoading(false)
    toast.success("Catégorie créee avec succès.")
  };

  const handleUpdateCategory = async () => {
    if(!editingCategoryId) return;
    setLoading(true);
    if(email){
      await updateCategory(editingCategoryId, email, name, description)
    }
    await loadCategories()
    closeModal()
    setLoading(false)
    toast.success("Catégorie modifiée avec succès.")

  } ;

   const openEditModal = (category: Category) => {
    setName(category.name);
    setDescription(category.description || "");
    setEditMode(true);
    setEditingCategoryId(category.id);
    (document.getElementById('category_modal') as HTMLDialogElement)?.showModal()
  };
  
   const handleDeleteCategory = async (categoryId: string) => {
    const confirmDelete = confirm("Voulez-vous vraiment supprimer  cette catégorie?  Tous les produits associés seront également supprimés")
    if(!confirmDelete) return
    await deleteCategory(categoryId, email)
    await loadCategories()
    toast.success("Catégorie supprimée avec succès.")
   };

   return (
  
  <Wrapper>
    <div>
            <div className='mb-4'>
                <button className='btn btn-primary'
                        onClick={openCreateModal}
                >
                    Ajouter une categorie
                </button>

            </div>
           {categories.length > 0 ? (
              <div>
                {categories.map((category) => (
                  <div  key={category.id} className='mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center'>
                    <div>
                      <strong className='text-lg'>{category.name}</strong>
                      <div className='text-sm'>{category.description}</div>
                    </div>
                    <div className='flex gap-2'>
                      <button className='btn btn-sm' onClick={ () => openEditModal(category)}>
                        <Pencil className='w-4 h-4'/>
                      </button>
                      <button className='btn btn-sm btn-error' onClick={ () => handleDeleteCategory(category.id)}>
                        <Trash className='w-4 h-4'/>
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <EmptyState
                  message={"Aucune catégorie disponible"}
                  IconComponent='Group'
                />
             
              )
             } 
    </div>
    <CategoryModal 
        name={name}
        description={description}
        loading={loading}
        onclose={closeModal}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onSubmit={editMode  ? handleUpdateCategory : handleCreateCategory}
        editMode={editMode}
    />
  </Wrapper>
    
  )
}



export default page