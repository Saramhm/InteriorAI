import { useState } from 'react';
import objectAliases from '../data/objectAliases';
import './FurnishRoom.css';
import RegionSelector from './RegionSelector';
import objectLibrary from '../data/objectLibrary';
export default function FurnishRoom({
  image,
  busy,
  selection,
  onSelect,
  onFurnish,
  apiUrl
}) {

  const [hoverObject,setHoverObject]=useState(null);

  const [prompt,setPrompt] = useState('');

  const [mode,setMode] = useState('inpaint');

  const [objectQuery,setObjectQuery] = useState('');

  const [localResults,setLocalResults] = useState([]);

  const [selectedObject,setSelectedObject] = useState(null);

  const selectFolder=(folder)=>{

    setSelectedObject(null);
    setHoverObject(null);
    searchObjects(folder);};

  const [showObjectResults,setShowObjectResults] = useState(false);

  const searchObjects = (value)=>{

  setObjectQuery(value);
  setShowObjectResults(true);

  if(!value.trim()){
    setLocalResults([]);
    return;
  }

  const query=value.toLowerCase().trim();

  const results=[];


  Object.entries(objectLibrary).forEach(
    ([folder,items])=>{

      const aliases = objectAliases[folder] || [];


      if(
        folder.includes(query) ||
        aliases.some(alias =>
          alias.toLowerCase().includes(query)
        )
      ){

        results.push(...items);

      }

    }
  );


  setLocalResults(results);

};

  const selectObject=(obj)=>{

    setSelectedObject(obj);

    setObjectQuery('');

    setShowObjectResults(false);

};



  const handleSubmit = ()=>{

    if(
      mode==="reference" &&
      !selectedObject
    )
      return;


    onFurnish(
      prompt.trim(),
      {
        mode,
        object:selectedObject
      }
    );

  };

  const promptKeywords = {
  inpaint: [
    "replace selected area with",
    "add a new",
    "place here",
    "fit naturally into the scene",
    "match existing style",
    "preserve room perspective",
    "blend with lighting",
    "toward the center"
  ],

  reference: [
    "place this object here",
    "replace selected area",
    "scale naturally",
    "match perspective and lighting",
    "keep original object design",
    "position near the wall",
    "place in the center",
    "blend seamlessly"
  ]
};


const addKeyword = (word)=>{
  setPrompt(prev =>
    prev.trim()
      ? `${prev}, ${word}`
      : word
  );
};

      return (
    <section className="tool-panel">

      <h2>Furnish Rooms</h2>


<div className="furnish-modes">

  <button
    className={
      mode==="inpaint"
      ?
      "active"
      :
      ""
    }
    onClick={()=>setMode("inpaint")}
    disabled={busy}
  >
    <span>
      AI Placement
    </span>

    <small>
      Generate objects for selected area
    </small>

  </button>


  <button
    className={
      mode==="reference"
      ?
      "active"
      :
      ""
    }
    onClick={()=>setMode("reference")}
    disabled={busy}
  >
    <span>
      By-reference Placement
    </span>

    <small>
      Add objects from your reference library
    </small>

  </button>

</div>


      <RegionSelector
        image={image}
        busy={busy}
        selection={selection}
        onSelect={onSelect}
        furnish
      />


      {
      mode==="reference" && (
        
        <div className="object-picker">


          <h3>
             Select Reference Object
          </h3>

          <div className="object-folders">

            {
            Object.keys(objectLibrary).map(folder=>(

            <button
            key={folder}
            onClick={()=>selectFolder(folder)}
            >
            {folder}
            </button>

            ))
            }

            </div>
          <input

            className="furnish-object-search"

            value={objectQuery}

            onChange={
              e=>searchObjects(e.target.value)
            }

            placeholder="Type object name..."
          />
              

              {
              showObjectResults && (

                <div className="object-results-panel">
                {
hoverObject && (

<div className="object-hover-preview">

<img
src={hoverObject.url}
alt={hoverObject.name}
/>

</div>

)
}
                  {
                    localResults.length > 0 && (

                      <div className="object-source">

<h4>
 Local Objects
</h4>


<div className="object-grid">

{
localResults.map((obj,index)=>(

<div
key={index}
className="object-card"
onClick={()=>selectObject(obj)}
onMouseEnter={()=>setHoverObject(obj)}
onMouseLeave={()=>setHoverObject(null)}
>

<img
src={obj.url}
alt={obj.name}
/>

</div>

))
}

</div>


</div>

                    )
                  }

                </div>

              )
              }


              {
              selectedObject && (

                <div className="selected-object-preview">

                  <span>
                    Selected object
                  </span>


                  <img
                    src={selectedObject.url}
                    alt={selectedObject.name}
                  />

                </div>

              )
              }
                  </div>

      )
      }
      
      <div className="prompt-keywords">

      {
      promptKeywords[mode].map((word,index)=>(

      <button
      key={index}
      type="button"
      onClick={()=>addKeyword(word)}
      >
      {word}
      </button>

      ))
      }

      </div>
      
      <label className="field-label">

        What should be added?


        <textarea

          value={prompt}

          disabled={busy}

          maxLength={600}

          onChange={
            e=>setPrompt(e.target.value)
          }

          placeholder="Add a modern sofa..."

        />

      </label>



      <button

        className="primary-action"

        disabled={
          busy ||
          !selection ||
          !prompt.trim() ||
          (
            mode==="reference" &&
            !selectedObject
          )
        }


        onClick={handleSubmit}

      >

        Add object

      </button>


    </section>
  );
}

