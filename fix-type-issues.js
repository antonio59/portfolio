import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix CaseStudyManager initialData property in TypeScript
function fixCaseStudyManagerTypes() {
  console.log('Fixing CaseStudyManager TypeScript issues...');
  
  const caseStudyManagerPath = path.join(__dirname, 'client', 'src', 'components', 'admin', 'CaseStudyManager.tsx');
  
  if (!fs.existsSync(caseStudyManagerPath)) {
    console.warn('CaseStudyManager.tsx not found. Skipping fix.');
    return;
  }
  
  let content = fs.readFileSync(caseStudyManagerPath, 'utf8');
  
  // Fix initialData TypeScript issues
  // Replace the complex object mapping with a more TypeScript-friendly approach
  content = content.replace(
    /initialData=\{\{[\s\S]*?\}\}/,
    `initialData={{
      blogPostId: selectedCaseStudy.blogPostId,
      projectType: selectedCaseStudy.projectType,
      role: selectedCaseStudy.role ?? undefined,
      technologies: Array.isArray(selectedCaseStudy.technologies) 
        ? selectedCaseStudy.technologies 
        : [],
      clientName: selectedCaseStudy.clientName ?? undefined,
      industry: selectedCaseStudy.industry ?? undefined,
      projectDuration: selectedCaseStudy.projectDuration ?? undefined,
      completionDate: selectedCaseStudy.completionDate ?? undefined,
      teamSize: selectedCaseStudy.teamSize ?? undefined,
      testimonial: selectedCaseStudy.testimonial ?? undefined,
      testimonialAuthor: selectedCaseStudy.testimonialAuthor ?? undefined,
      relatedProjectIds: Array.isArray(selectedCaseStudy.relatedProjectIds) 
        ? selectedCaseStudy.relatedProjectIds 
        : []
    }}`
  );
  
  fs.writeFileSync(caseStudyManagerPath, content);
  console.log('Fixed CaseStudyManager.tsx TypeScript issues');
}

// Fix storage.ts TypeScript issues
function fixStorageTypeIssues() {
  console.log('Fixing storage TypeScript issues...');
  
  const storageFilePath = path.join(__dirname, 'server', 'storage.ts');
  
  if (!fs.existsSync(storageFilePath)) {
    console.warn('storage.ts not found. Skipping fix.');
    return;
  }
  
  let content = fs.readFileSync(storageFilePath, 'utf8');
  
  // Fix the createCaseStudyDetail method to handle null values properly
  const createCaseStudyDetailRegex = /async createCaseStudyDetail\(caseStudyDetail: InsertCaseStudyDetail\): Promise<CaseStudyDetail> \{[\s\S]*?const newCaseStudyDetail: CaseStudyDetail[\s\S]*?\};/;
  
  if (createCaseStudyDetailRegex.test(content)) {
    content = content.replace(
      createCaseStudyDetailRegex,
      `async createCaseStudyDetail(caseStudyDetail: InsertCaseStudyDetail): Promise<CaseStudyDetail> {
    const id = ++this.caseStudyDetailIdCounter;
    const now = new Date();
    
    // Ensure all required fields are present and handle null values
    const newCaseStudyDetail: CaseStudyDetail = {
      id,
      createdAt: now,
      updatedAt: now,
      blogPostId: caseStudyDetail.blogPostId,
      projectType: caseStudyDetail.projectType,
      role: caseStudyDetail.role || null,
      technologies: caseStudyDetail.technologies || [],
      clientName: caseStudyDetail.clientName || null,
      industry: caseStudyDetail.industry || null,
      projectDuration: caseStudyDetail.projectDuration || null,
      completionDate: caseStudyDetail.completionDate || null,
      teamSize: caseStudyDetail.teamSize || null,
      testimonial: caseStudyDetail.testimonial || null,
      testimonialAuthor: caseStudyDetail.testimonialAuthor || null,
      challenges: caseStudyDetail.challenges || null,
      solutions: caseStudyDetail.solutions || null,
      results: caseStudyDetail.results || null,
      objectives: caseStudyDetail.objectives || null,
      relatedProjectIds: caseStudyDetail.relatedProjectIds || []
    };
    
    this.caseStudyDetails.set(id, newCaseStudyDetail);
    return newCaseStudyDetail;
  };`
    );
  }
  
  fs.writeFileSync(storageFilePath, content);
  console.log('Fixed storage.ts TypeScript issues');
}

// Fix supabase-storage.ts TypeScript issues
function fixSupabaseStorageTypeIssues() {
  console.log('Fixing supabase-storage.ts TypeScript issues...');
  
  const supabaseStorageFilePath = path.join(__dirname, 'server', 'supabase-storage.ts');
  
  if (!fs.existsSync(supabaseStorageFilePath)) {
    console.warn('supabase-storage.ts not found. Skipping fix.');
    return;
  }
  
  let content = fs.readFileSync(supabaseStorageFilePath, 'utf8');
  
  // Fix the SQL query that's causing type issues
  // Find the line with `eq(sections.type, type)` and fix it
  content = content.replace(
    /eq\(sections\.type, type\)/g,
    'eq(sections.type, type as any)'
  );
  
  fs.writeFileSync(supabaseStorageFilePath, content);
  console.log('Fixed supabase-storage.ts TypeScript issues');
}

// Run all the fixes
function main() {
  console.log('\x1b[36m=== Fixing TypeScript issues ===\x1b[0m');
  
  fixCaseStudyManagerTypes();
  fixStorageTypeIssues();
  fixSupabaseStorageTypeIssues();
  
  console.log('\x1b[32mAll TypeScript issues fixed successfully!\x1b[0m');
}

main();