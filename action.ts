"use server"


import { Category } from "@prisma/client";
import prisma from "./lib/prisma";
import { FormDataType, OrderItem, Product, Transaction } from "./type";

export async function checkAndAddAssociation( email: string, name : string){
    if(!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email: email,
            },
        });
        if(!existingAssociation  &&  name  ) {
            await prisma.association.create({
                data: {
                    email: email,
                    name: name,
                },
            });
            console.log("Association added successfully");
        }

    } catch (error) {
        console.error("Error checking or adding association:", error);
    }
}

/**  1ère fonction qui permet d'obtenir une association*/
export async function getAssociation(email :string) {
    if (!email) return 
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })
        return existingAssociation
    } catch (error){
        console.error(error)
    }
}

/* 2ère fonction qui permet de créer une categorie*/


export async function createCategory( name: string, email: string, description?: string){
    if(!name) return 
    try{
        const association = await getAssociation(email)
        if(!association){
            throw new Error("Aucune association touvée avec cet email.");
        }  
        await prisma.category.create({
            data: {
                name,
                description : description || "",
                associationId : association.id
            }
        })     
    } catch (error){
        console.error(error)
    }
}

/* 3 ème fonction qui permet de mettre à jour la categorie*/

export async function updateCategory(
    id: string, email: string, name: string, description?: string
) {
    if(!id || !email || !name){
        throw new Error("L'id , l'email, le nom de l'association sont requis pour la modification")
    }
    try{
        const association = await getAssociation(email)
        if(!association) {
            throw new Error("Aucune association trouvéé avec cet email");
        }
        await prisma.category.update({
            where: {
                id: id,
                associationId: association.id
            },
            data: {
                name,
                description: description || "",
            }
        })
    } catch (error){
        console.error(error)
    }

}

/* 4 ème fonction pour la suppression*/

export async function deleteCategory(id: string, email: string){
    if(!id || !email ){
        throw new Error("L'id , l'email de l'association sont requis pour la suppression")
    }
    try{
        const association = await getAssociation(email)
        if(!association) {
            throw new Error("Aucune association trouvéé avec cet email");
        }
        await prisma.category.delete({
            where: {
                id: id,
                associationId: association.id
            }
            
        })
    } catch (error){
        console.error(error)
    }

}

/* 5ème fonction qui permett d'afficher toutes le categories*/

export async function readCategory(email: string) : Promise<Category[] | undefined>{
     if( !email ){
        throw new Error("L'email de l'association est requis pour la lecture des catégories")
    }
    try{
        const association = await getAssociation(email)
        if(!association) {
            throw new Error("Aucune association trouvéé avec cet email");
        }
        const categories = await prisma.category.findMany({
             
            where: {
                
                associationId: association.id
            }
            
        }) 
        return categories

    } catch (error){
        console.error(error)
    }

}
// fonction pour la création du produit
export async function createProduct(formData: FormDataType, email: string){
    try{
        const {name,description, price, categoryId, unit, imageUrl}= formData;
            if( !name || !price || !categoryId || !email ){
                throw new Error("Le nom , le prix, l'email et l'id de la category de l'association sont requis pour la creation des catégories")
            }
            const safeImageUrl = imageUrl || "";
            const safeUnit = unit || "";
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }
        await prisma.product.create({
                data: {
                    name,
                    description,
                    price: Number(price),
                    categoryId,
                    unit: safeUnit,
                    imageUrl: safeImageUrl,
                    associationId: association.id
                }})

        } catch (error){
            console.error(error)
        }

}
 //fonction de la mise à jour du produit
export async function updateProduct(formData: FormDataType, email: string){
    try{
        const { id,name,description, price,  imageUrl}= formData;
            if( !name || !price || !id || !email ){
                throw new Error("Le nom , le prix, l'email et l'id de l'association sont requis pour la mise à jour des catégories")
            }
           
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }
        await prisma.product.update({
            where :{
                id: id,
                associationId: association.id
            },
            data: {
                    name,
                    description,
                    price: Number(price),
                    imageUrl: imageUrl,
                    
                }})

        } catch (error){
            console.error(error)
        }

}

 //fonction de la suppression du produit
export async function deleteProduct(id: string, email: string){
    try{
        
            if( !id  ){
                throw new Error("L'id de l'association sont requis pour la suppression des catégories")
            }
           
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }
        await prisma.product.delete({
            where :{
                id: id,
                associationId: association.id
            },
        })
        } catch (error){
            console.error(error)
        }

} //fonction la lecture  des produits
export async function readProducts(email: string) : Promise<Product[] | undefined>{
    try{
        
            if( !email  ){
                throw new Error("L'email de l'association sont requis pour la lecture des catégories")
            }
           
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }

        const products = await prisma.product.findMany({
            where :{
                associationId: association.id
            },
            include: {
                category: true
            }
        })
        return products.map(product => ({
            ...product,
            categoryName: product.category?.name 
           
        }))
        } catch (error){
            console.error(error)
        }

}
// fonction permettant de lire un produit par son id
export async function readProductById(productId : string, email: string) : Promise<Product | undefined>{
    try{
        
            if( !email  ){
                throw new Error("L'email de l'association sont requis pour la lecture d'une catégorie")
            }
           
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }

        const product = await prisma.product.findUnique({
            where :{
                id: productId,
                associationId: association.id
            },
            include: {
                category: true
            }
        })
        if (!product){
            return undefined
            } 

        return { 
            ...product,
            categoryName: product.category?.name 
           
        }
    } catch (error){
         console.error(error)
    }

}

export async function replenishStockWithTransaction(productId: string, quantity: number, email:string){

    try {
        if(quantity <= 0){
            throw new Error("La quantité à ajouter doit être supérieure à zéro.")
        }

        if(!email){
            throw new Error("l'email est requis.")

        }
        
        const association = await getAssociation(email)
        if(!association){
            throw new Error("Aucune association trouvé avec cet email.");

        }

        await prisma.product.update({
            where: {
                id: productId,
                associationId: association.id
            },
            data: {
                quantity: {
                    increment: quantity
                }
            }

        })
        await prisma.transaction.create({
            data: {
                type: "IN",
                quantity: quantity,
                productId: productId,
                associationId: association.id
            }
        })

     
    } catch (error) {
        console.error(error)
        
    }
}

export async function deductStockWithTransaction( orderItems:OrderItem[], email:string){

    try {
        

        if(!email){
            throw new Error("l'email est requis.")

        }
        
        const association = await getAssociation(email)
        if(!association){
            throw new Error("Aucune association trouvé avec cet email.");

        }
        for( const item of orderItems ) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId}
        })

        if(!product){
            throw new Error(`Aucun produit trouvé avec l'ID ${item.productId}`);
        }

        if(item.quantity <=0){
            throw new Error(`La quantité demandée pour "${product.name}" doit être supérieure à zéro.`);
        }


        if(product.quantity < item.quantity){
            throw new Error(`Le produit "${product.name}" n'a pas assez de stock . Demandé : ${item.quantity}, Disponible: ${product.quantity} / ${product.unit}.`);
        }
    }

    await prisma.$transaction(async (tx) => {
        for(const item of orderItems ) {

            await tx.product.update({
                where: {
                    id: item.productId,
                    associationId: association.id
                },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }
                }
            });

            tx.transaction.create({
                data: {
                    type: "OUT",
                    quantity: item.quantity,
                    productId: item.productId,
                    associationId: association.id
                }
            })
      
        }
        
    })
    

    return{sucess: true}     
    } catch (error) {
        console.error(error)
        return {sucess: false, message: error }
    }
}

export async function getTransaction(email : string, limit? : number) : Promise< Transaction[]>{
    try{
        
            if( !email  ){
                throw new Error("L'email de l'association sont requis pour la lecture d'une catégorie")
            }
           
            
            const association = await getAssociation(email)
            if(!association) {
                    throw new Error("Aucune association trouvéé avec cet email");
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                associationId: association.id
            },
            orderBy : {
                createdAt: "desc"
            },
            take: limit,

            include: {
                product : {
                    include : {
                        category :  true
                    }
                }
            }
        })
        
        return transactions.map((tx) => ({
            ...tx,
            categoryName : tx.product.category.name,
            productName : tx.product.name,
            imageUrl : tx.product.imageUrl,
            price : tx.product.price,
            unit : tx.product.unit
        }))
    } catch (error){
         console.error(error)
         return []
    }

}