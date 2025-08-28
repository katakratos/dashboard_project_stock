import React from 'react'
interface Porps {
    name: string,
    description: string,
    loading:boolean,
    onclose:() => void,
    onChangeName: (value: string) => void,
    onChangeDescription: (value: string) => void,
    onSubmit: () => void,
    editMode?: boolean
}

const CategoryModal : React.FC<Porps> = ({name, description, loading, onclose, onChangeDescription, onChangeName, editMode, onSubmit}) => {
  return (
   <dialog id='category_modal' className='modal'> 
    <div className='modal-box'>
        <form method="dialog">
            <button className='btn btn-sm btn-circle btn-ghost absolute rigth-4 top-2'
                    onClick={onclose}
            >
                         X
            </button>
       
        <h3 className='font-bold text-lg'> {editMode ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
        <input 
            type="text"
            placeholder='Non'
            value={name}
            onChange={(e)=> onChangeName(e.target.value)} 
            className='input input-bordered w-full mb-4'
        />
        <input 
            type="text"
            placeholder='Description'
            value={description}
            onChange={(e)=> onChangeDescription(e.target.value)} 
            className='input input-bordered w-full mb-4'
        />
        
        <button
            className='btn btn-primary'
            onClick={onSubmit} 
            disabled={loading} 
        
        >
            {loading
                ? editMode
                    ? "Modification en cours..."
                    : "Ajout en cours..."
                : editMode
                    ? "Modifier la catégorie"
                    : "Ajouter la catégorie"}

            </button>
         </form>
    </div>
   </dialog>
  )
}

export default  CategoryModal