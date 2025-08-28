"use client"
import Wrapper from '@/components/Wrapper'
import { useUser } from '@clerk/nextjs'
import React, {useEffect, useState} from 'react'
import { FormDataType } from '../../../type'
import { Category } from '@prisma/client'
import { createProduct, readCategory } from '../../../action'
import { FileImage } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'


const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {user} = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [file, setFile] = useState<File | null>(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [categories, setCategories] = useState<Category[]>([])
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: ""
    
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   // eslint-disable-next-line react-hooks/rules-of-hooks
   useEffect(() => {
      const fetchCategories = async () => {
        try{
          if(email) {
          const data = await readCategory(email);
          if(data)
            setCategories(data);
        }
        } catch (error) {
          console.error("Erreur lors du chargement des categories:", error);
        }
        
      }
      fetchCategories();
    }, [email]) ;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      setFile(selectedFile);
      if(selectedFile){
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    }
    
    const handleSubmit = async () => {
      if(!file){
        toast.error("Veuillez sélectionner une image")
        return
      }
      try {
        const imageData = new FormData()
        
        imageData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: imageData
        })
        const data = await res.json()
        if(!data.success){
          throw new Error("Échec de l'upload de l'image")
        }else {
          formData.imageUrl = data.path
          await createProduct(formData, email)
          toast.success("Produit crée avec succèss")
          router.push('/products')
        }
      } catch (error) {
        console.log("Erreur lors de la création du produit:", error);
        toast.error("IL y' a aune erreur")
        
      }
    }
  return (
    <Wrapper>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold mb-4'>
            Créer un produit
          </h1>
          <section className='flex md:flex-row flex-col'>
            <div className='space-y-4 md:w[450px]'>
              <input 
                type="text"
                name='name'
                placeholder="Nom"
                className='input input-bordered'
                value={formData.name}
                onChange={handleChange}
              />
              <textarea 
                name="description" 
                placeholder="Description"
                className='textarea textarea-bordered w-full'
                value={formData.description}
                onChange={handleChange}
              >

              </textarea>
              <input 
                type="text"
                name='price'
                placeholder="Prix"
                className='input input-bordered w-full'
                value={formData.price}
                onChange={handleChange}
              />
              <select

                className='select select-bordered w-full'
                value={formData.categoryId}
                name='categoryId'
                onChange={handleChange}
              >

                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
               )) }    
              </select>

              <select

                className='select select-bordered w-full'
                value={formData.unit}
                name='unit'
                onChange={handleChange}
              >

                <option value="">Sélectionner unité</option>
                <option value="g">Gramme</option>
                <option value="kg">kilogramme</option>
                <option value="l">Litre</option>
                <option value="m">Mètre</option>
                <option value="cm">Centimètre</option>
                <option value="h">Heure</option>
                <option value="pcs">Pièces</option> 
              </select>
              <input 
                type="file"
                accept='image/*'
                name='image/*'
                placeholder="Image"
                className='file-input file-input-bordered w-full'
                onChange={handleFileChange}
              />
              <button onClick={handleSubmit} className='btn btn-primary'>
                Créer le produit
              </button>
            </div>
            <div className='md:ml-4 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] p-5 flex jutify-center items-center rounded-3xl'>
              {previewUrl && previewUrl !== "" ? (
                <div> 
                  <ProductImage
                    src={previewUrl}
                    alt="preview"
                    heightClass='h-40'
                    widthClass='w-40'
                  />
                </div>
              ) : (
                <div className='wiggle-animation'>
                    <FileImage strokeWidth={1} className='h-10 w-10 text-primary'/>
                </div>
              )}
               
               
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  )
}


export default page