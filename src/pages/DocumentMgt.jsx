import React, { useState } from 'react';
import { 
  FileText, 
  FolderPlus, 
  Search, 
  Upload, 
  Download,
  Trash2,
  Eye,
  Share2,
  Filter,
  Clock,
  File,
  X,
  Plus,
  Tag
} from 'lucide-react';
import Navbar from '../layout/navbar.jsx';


const initialDocuments = [
  {
    id: 1,
    name: 'Lease Agreement - Unit 304',
    type: 'PDF',
    size: '2.5 MB',
    category: 'Lease Agreements',
    lastModified: '2024-01-25',
    tags: ['Active', 'Legal'],
    shared: true
  },
  {
    id: 2,
    name: 'Insurance Policy 2024',
    type: 'PDF',
    size: '1.8 MB',
    category: 'Insurance',
    lastModified: '2024-01-20',
    tags: ['Insurance', 'Important'],
    shared: false
  },
  {
    id: 3,
    name: 'Maintenance Report - Q4 2023',
    type: 'Excel',
    size: '950 KB',
    category: 'Maintenance',
    lastModified: '2024-01-15',
    tags: ['Reports', 'Maintenance'],
    shared: true
  }
];









const DocumentManagement = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeModule, setActiveModule] = useState('Document Management')

  const categories = ['All', 'Lease Agreements', 'Insurance', 'Maintenance', 'Financial', 'Legal'];

  const getFileIcon = (type) => {
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const UploadModal = ({ isOpen, onClose }) => {
    const [uploadData, setUploadData] = useState({
      name: '',
      category: '',
      tags: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);
  
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    };
  
    const handleFileSelect = (file) => {
      if (file) {
        setSelectedFile(file);
        setUploadData(prev => ({
          ...prev,
          name: file.name
        }));
      }
    };
  
    const handleFileInput = (e) => {
      const file = e.target.files[0];
      handleFileSelect(file);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!selectedFile) {
        alert('Please select a file');
        return;
      }

    // Create new document object
    const newDocument = {
      id: Date.now(),
      name: uploadData.name,
      type: selectedFile.name.split('.').pop().toUpperCase(),
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      category: uploadData.category,
      lastModified: new Date().toISOString().split('T')[0],
      tags: uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      shared: false
    };

    // Add document to list
    // setDocuments(prev => [...prev, newDocument]);
    onClose();
  };

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${!isOpen && 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={uploadData.name}
              onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              className="w-full p-2 border rounded"
              value={uploadData.category}
              onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={uploadData.tags}
              onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
              placeholder="e.g., important, legal, active"
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${selectedFile ? 'bg-green-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
             className='hidden'
            />
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-green-500" />
                <p className="text-green-600">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supported files: PDF, DOC, DOCX, XLS, XLSX
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!selectedFile}
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  };
  

  const DocumentCard = ({ document }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {getFileIcon(document.type)}
          <div>
            <h3 className="font-medium">{document.name}</h3>
            <p className="text-sm text-gray-500">{document.size} • {document.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {document.shared && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Shared
            </span>
          )}
        </div>
      </div>

      <div className="space-x-1 mb-4">
        {document.tags.map((tag, index) => (
          <span 
            key={index}
            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Last modified: {document.lastModified}</span>
        <div className="flex space-x-2">
          <button className="hover:text-blue-600">
            <Eye className="w-4 h-4" />
          </button>
          <button className="hover:text-blue-600">
            <Download className="w-4 h-4" />
          </button>
          <button className="hover:text-blue-600">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  


  return (
    <Navbar module={activeModule} >
        <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
  {/* Action Buttons */}
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => setShowUploadModal(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
    >
      <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      <span>Upload Document</span>
    </button>
    <button 
      className="bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded flex items-center flex-shrink-0 text-sm sm:text-base transition-colors"
    >
      <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      <span>New Folder</span>
    </button>
  </div>

  {/* Search and Filter */}
  <div className="flex gap-2 w-full sm:w-auto">
    <div className="relative flex-grow sm:flex-grow-0">
      <input
        type="text"
        placeholder="Search documents..."
        className="w-full sm:w-[250px] pl-9 pr-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
    </div>
    <button 
      className="bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors flex-shrink-0"
      aria-label="Filter"
    >
      <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
</div>

      {/* Category Tabs */}
     {/* Scrollable container for categories */}
{/* Responsive container for categories */}
<div className="relative">
  <div className="border-b">
    <div className="flex flex-wrap -mb-px">
      {categories.map(category => (
        <button
          key={category}
          className={`inline-flex items-center px-4 py-2 text-sm border-b-2 transition-colors
            ${selectedCategory === category
              ? 'border-blue-500 text-blue-500 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }
            mr-2 mb-2 sm:mb-0
          `}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents
          .filter(doc => 
            (selectedCategory === 'All' || doc.category === selectedCategory) &&
            doc.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
    </Navbar>
 
)

  };




  export default DocumentManagement