import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Sparkles, Upload, Type } from 'lucide-react';

const ImageEditor = () => {
  const canvasRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Redraw canvas when elements change
  useEffect(() => {
    if (canvasRef.current && selectedTemplate) {
      drawCanvas();
    }
  }, [elements, selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/image-editor/templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const selectTemplate = async (template) => {
    setSelectedTemplate(template);
    setLoading(true);

    try {
      const response = await fetch('/api/image-editor/canvas/new', {
        method: 'POST',
        params: { template_id: template.id }
      });
      const data = await response.json();
      setSessionId(data.session_id);
      setElements([]);
    } catch (error) {
      console.error('Error creating canvas:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Parse dimensions
    const [width, height] = selectedTemplate.dimensions.split('x').map(Number);
    canvas.width = width;
    canvas.height = height;

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw elements
    elements.forEach((element) => {
      if (element.type === 'image' && element.image) {
        ctx.drawImage(element.image, element.x || 0, element.y || 0, element.width || 100, element.height || 100);
      } else if (element.type === 'text') {
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontSize || 24}px ${element.font || 'Arial'}`;
        ctx.fillText(element.content, element.x || 10, element.y || 30);
      }
    });

    // Highlight selected element
    if (selectedElement && elements[selectedElement]) {
      const el = elements[selectedElement];
      ctx.strokeStyle = '#0A66C2';
      ctx.lineWidth = 2;
      ctx.strokeRect(el.x || 0, el.y || 0, el.width || 100, el.height || 100);
    }
  };

  const addTextElement = () => {
    const newElement = {
      type: 'text',
      content: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 32,
      font: 'Arial',
      color: '#000000'
    };
    setElements([...elements, newElement]);
    setSelectedElement(elements.length);
  };

  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const newElement = {
            type: 'image',
            image: img,
            x: 50,
            y: 50,
            width: 200,
            height: 150
          };
          setElements([...elements, newElement]);
          setSelectedElement(elements.length);
        };
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const updateElement = (index, field, value) => {
    const updated = [...elements];
    updated[index] = { ...updated[index], [field]: value };
    setElements(updated);
  };

  const generateWithAI = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/image-editor/generate', {
        method: 'POST',
        params: {
          product_name: 'Ad Campaign',
          headline: 'Attract More Customers',
          description: 'Increase your sales with our platform',
          platform: selectedTemplate.platform || 'facebook',
          style: 'modern'
        }
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setUploadedImage(url);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'ad-campaign.png';
    link.click();
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-slate-900 text-slate-100 min-h-screen">
      {/* Sidebar - Templates */}
      <div className="col-span-3 border border-slate-700 rounded-lg p-4 bg-slate-800 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Templates</h2>

        <div className="space-y-2 mb-4">
          {templates.slice(0, 6).map((template) => (
            <button
              key={template.id}
              onClick={() => selectTemplate(template)}
              className={`w-full p-3 rounded text-left transition ${
                selectedTemplate?.id === template.id
                  ? 'bg-blue-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <div className="font-semibold text-sm">{template.name}</div>
              <div className="text-xs text-slate-400">{template.dimensions}</div>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-4">
          <h3 className="font-bold mb-2 text-sm">Tools</h3>
          <div className="space-y-2">
            <button
              onClick={addTextElement}
              className="w-full flex items-center gap-2 p-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
            >
              <Type size={16} /> Add Text
            </button>
            <button
              onClick={addImageElement}
              className="w-full flex items-center gap-2 p-2 rounded bg-slate-700 hover:bg-slate-600 text-sm"
            >
              <Upload size={16} /> Add Image
            </button>
            <button
              onClick={generateWithAI}
              disabled={loading}
              className="w-full flex items-center gap-2 p-2 rounded bg-purple-600 hover:bg-purple-700 text-sm"
            >
              <Sparkles size={16} /> AI Generate
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="col-span-6 border border-slate-700 rounded-lg p-4 bg-slate-800 flex flex-col items-center justify-center">
        {selectedTemplate ? (
          <>
            <canvas
              ref={canvasRef}
              className="border border-slate-600 bg-white shadow-lg max-w-full max-h-96 cursor-crosshair"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={exportImage}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                <Download size={16} /> Export
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-slate-400">Select a template to start editing</p>
          </div>
        )}
      </div>

      {/* Element Properties */}
      <div className="col-span-3 border border-slate-700 rounded-lg p-4 bg-slate-800 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Properties</h2>

        {selectedElement !== null && elements[selectedElement] ? (
          <div className="space-y-3">
            {elements[selectedElement].type === 'text' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1">Text</label>
                  <input
                    type="text"
                    value={elements[selectedElement].content}
                    onChange={(e) => updateElement(selectedElement, 'content', e.target.value)}
                    className="w-full px-2 py-1 rounded bg-slate-700 border border-slate-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Font Size</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={elements[selectedElement].fontSize}
                    onChange={(e) => updateElement(selectedElement, 'fontSize', Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-slate-400">{elements[selectedElement].fontSize}px</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Color</label>
                  <input
                    type="color"
                    value={elements[selectedElement].color}
                    onChange={(e) => updateElement(selectedElement, 'color', e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </>
            )}

            {elements[selectedElement].type === 'image' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1">Width</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={elements[selectedElement].width}
                    onChange={(e) => updateElement(selectedElement, 'width', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Height</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={elements[selectedElement].height}
                    onChange={(e) => updateElement(selectedElement, 'height', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">Position X</label>
              <input
                type="range"
                min="0"
                max="1200"
                value={elements[selectedElement].x || 0}
                onChange={(e) => updateElement(selectedElement, 'x', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Position Y</label>
              <input
                type="range"
                min="0"
                max="800"
                value={elements[selectedElement].y || 0}
                onChange={(e) => updateElement(selectedElement, 'y', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Select an element to edit properties</p>
        )}

        {/* Element List */}
        <div className="mt-6 border-t border-slate-700 pt-4">
          <h3 className="font-bold text-sm mb-2">Elements</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {elements.map((el, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedElement(idx)}
                className={`w-full text-left p-2 rounded text-xs ${
                  selectedElement === idx
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {el.type === 'text' ? `📝 ${el.content.substring(0, 20)}` : '🖼️ Image'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
