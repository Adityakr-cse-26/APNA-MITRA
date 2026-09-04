const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const supabaseKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicates() {
  // fetch all books
  const { data: books, error } = await supabase.from('books').select('*');
  if (error) {
    console.error('Error fetching books:', error);
    return;
  }
  
  console.log(`Fetched ${books.length} books`);
  
  const bookMap = {};
  const duplicates = [];
  
  for (const book of books) {
    const key = `${book.title}_${book.author}_${book.language}`;
    if (bookMap[key]) {
      // It's a duplicate, we should delete it
      duplicates.push(book.id);
      console.log(`Found duplicate: ${book.title} (ID: ${book.id})`);
    } else {
      bookMap[key] = true;
    }
  }
  
  console.log(`Total duplicates found: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('Deleting duplicates...');
    const { error: delError } = await supabase.from('books').delete().in('id', duplicates);
    if (delError) {
      console.error('Error deleting duplicates:', delError);
    } else {
      console.log('Duplicates deleted successfully.');
    }
  } else {
    console.log('No duplicates to delete.');
  }
}

deleteDuplicates();
