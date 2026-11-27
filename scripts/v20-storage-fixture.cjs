'use strict';
// Deterministic synthetic material only. This function is also evaluated inside the isolated page.
function makeStorageFixture(options = {}) {
  const chapterCount = options.chapterCount || 100, chapterChars = options.chapterChars || 10000;
  const snapshotCount = options.snapshotCount ?? 24, snapshotChars = options.snapshotChars || 1048576;
  const epoch = 1795708800000;
  function chapter(bookId, index, chars, snapshot) {
    const prefix = 'Synthetic chapter ' + (index + 1) + '：林舟在北岸核对旧信，记录证人与港口的约定。';
    const content = (prefix + ' 甲乙丙丁戊己庚辛壬癸。'.repeat(Math.ceil(chars / 12))).slice(0, chars);
    return {id:bookId+'-ch-'+index,branchId:'main',memoryUserInput:'',title:'第'+(index+1)+'章 合成验收',content,storyTime:'',summary:'林舟核对第'+(index+1)+'份旧信。',summaryMissing:false,cotThinking:'',nativeThinking:'',toolTimeline:[],wordCount:chars,isExpanded:false,isEditing:false,contentHeight:0,versions:[],activeVersionIdx:0,createdAt:epoch+index,comments:[],isGeneratingComments:false,showComments:false,regenSnapshot:snapshot?{version:1,messages:[{role:'system',content:('SYNTHETIC SNAPSHOT '+index+' ').padEnd(snapshotChars,'x')}],request:{url:'https://synthetic.invalid/v1/chat/completions',model:'fixture-model',adapterId:'openai-compatible'},streamEnabled:true,wordCountTarget:3000,hardConstraints:[],promptOverride:'',snowwingCotContext:null,targetChapterNo:index+1,mode:'generate',createdAt:epoch+index}:null};
  }
  function book(id, count, chars, snapshots, vectorCount) {
    return {id,title:'合成验收 '+id,lastModified:epoch,wordCount:count*chars,novel:{title:'合成验收 '+id,theme:'性能存储固定样例',synopsis:'',worldView:'',negativePrompt:'',isAdultMode:false,outline:''},chapters:Array.from({length:count},(_,i)=>chapter(id,i,chars,i<snapshots)),characters:[],chapterOutlines:[],chapterIndexDrafts:[],foreshadowMatrix:[],branchList:[{id:'main',name:'主线',forkFromChapterId:null,forkIndex:0}],activeBranchId:'main',branchData:{main:{chapterOutlines:[],chapterIndexDrafts:[],foreshadowMatrix:[],staleMarks:[]}},memoryLibrary:{version:2,settings:{enabled:false,autoSummarize:false,replaceHistoryWithSummaries:false,mode:'classic'},memories:Array.from({length:vectorCount},(_,i)=>({chapterId:id+'-ch-'+(i%count),branchId:'main',sourceHash:'synthetic-'+i,text:'合成记忆：第'+i+'条旧信与证人的事实。',sourceUserText:'',enabled:true,at:epoch+i,vector:Array.from({length:384},(_,j)=>((i+j)%255)-127),vectorModel:'synthetic-384',vectorTextHash:'synthetic-'+i})),groups:[]}};
  }
  return {books:[book('v20-large',chapterCount,chapterChars,snapshotCount,chapterCount),book('v20-other',24,5000,4,24),book('v20-small',2,1000,0,2)],currentBookId:'v20-large'};
}
module.exports={makeStorageFixture};
