import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [formData, setFormData] = useState({ companyName: '', role: '', startDate: '', endDate: '' });
  const [file, setFile] = useState(null);

  // Fetch my internships
  useEffect(() => {
    const fetchInternships = async () => {
      const { data } = await api.get('/internships');
      setInternships(data);
    };
    fetchInternships();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Uploader Logic: Using FormData for Local Files
    const data = new FormData();
    data.append('companyName', formData.companyName);
    data.append('role', formData.role);
    data.append('startDate', formData.startDate);
    data.append('endDate', formData.endDate);
    if (file) data.append('offerLetter', file);

    try {
      const { data: newInternship } = await api.post('/internships', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setInternships([...internships, newInternship]);
      alert('Internship Submitted Successfully!');
    } catch (err) {
      alert(err.response.data.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}</h1>
      
      {/* FORM SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-lg border mb-10">
        <h2 className="text-xl font-semibold mb-4">Add Internship Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Company Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
          <input type="text" placeholder="Role/Position" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, role: e.target.value})} />
          <input type="date" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
          <input type="date" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
          
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Upload Offer Letter (Local)</label>
            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <button type="submit" className="md:col-span-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200">
            Submit Application
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {internships.map((i) => (
              <tr key={i._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {i.offerLetter && <a href={`http://localhost:5000${i.offerLetter}`} target="_blank" className="text-blue-600 hover:text-blue-900">View Doc</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
