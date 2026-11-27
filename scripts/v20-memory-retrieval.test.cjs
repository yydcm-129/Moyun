'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../source/moyun.single.html'),'utf8').replace(/\r\n/g,'\n');
function fn(name){let at=source.indexOf('    function '+name+'(');if(at<0)at=source.indexOf('    async function '+name+'(');assert.ok(at>=0,name);return source.slice(at,source.indexOf('\n    }',at)+6);}
function runtime(extra={}){
 const c={settings:{value:{contextHistoryCharLimit:15000,contextMaxChapterSummaryChars:600,contextSummaryChapters:10,contextFullChapters:3,contextUseFullText:true,contextUseChapterSummaries:true,contextUseRangeSummaries:true,contextUseContextLimit:true,contextMaxFullChapterChars:5000}},memoryLibrary:{value:{settings:{enabled:true,mode:'enhanced',summaryKeepChapters:10,replaceHistoryWithSummaries:false},memories:[],blocks:[],groups:[]}},summaries:{value:[]},memoryLastRecall:{value:[]},currentBookId:{value:'book'},activeBranchId:{value:'main'},visibleChapters:{value:[]},chapters:{value:[]},isGenerating:{value:false},memoryProgress:{value:{done:0,total:0}},memorySourceCache:new WeakMap(),memoryBlockCache:new WeakMap(),memoryFailures:{value:{}},btoa:globalThis.btoa,atob:globalThis.atob,memorySettingsKey:()=> 'settings',memoryTextHash(text){let a=2166136261;for(let i=0;i<text.length;i++)a=Math.imul(a^text.charCodeAt(i),16777619);return text.length+':'+(a>>>0).toString(36);},cleanNarrativeChapterContent:ch=>String(ch.content||''),cleanNarrativeChapterSummary:ch=>String(ch.summary||''),cleanNarrativeSourceText:s=>s,formatSnowwingChapterStoryTimeContext:()=>'',formatSnowwingSummaryStoryTimesContext:()=>'',isSummaryInCurrentBranch:()=>true,validMemoryGroups:()=>[],getValidMemoryRows:()=>[],memoryEmbeddingFingerprint:()=> 'model',getMemoryRequest:()=>({}),fetchMemoryEmbeddings:async(req,inputs)=>inputs.map(()=>({data:btoa(String.fromCharCode(127,0)),scale:1,dims:2})),saveData:()=>{},showToast:()=>{},sanitizeApiErrorDetail:s=>String(s),...extra};
 c.deepClone=value=>JSON.parse(JSON.stringify(value));vm.createContext(c);return c;
}
function run(c,...names){vm.runInContext(names.map(fn).join('\n'),c);}
const chapter={id:'c1',branchId:'main',title:'初遇',content:Array.from({length:8},(_,i)=>'第'+(i+1)+'段。林岚将星图交给顾迟，线索'+(i+1)+'。').join(String.fromCharCode(10,10)),summary:'摘要事实'};

test('父子块保留原文位置和层级，分块不超过 900 字',()=>{
 const c=runtime();run(c,'memoryTextHash','memoryChapterHash','splitMemoryBlocks');const blocks=c.splitMemoryBlocks(chapter,1),parents=blocks.filter(b=>b.kind==='parent'),children=blocks.filter(b=>b.kind==='child');
 assert.ok(children.length>=3);assert.ok(parents.length>=1);assert.ok(children.every(b=>b.text.length<=900&&b.start<b.end&&chapter.content.slice(b.start,b.end)===b.sourceText));assert.ok(children.every(b=>parents.some(p=>p.id===b.parentId)));
 assert.ok(parents.every(p=>children.filter(b=>b.parentId===p.id).length<=3));
 const edited={...chapter,content:chapter.content.replace('交给','递给')};const editedBlocks=c.splitMemoryBlocks(edited,1),oldChildren=blocks.filter(b=>b.kind==='child'),newChildren=editedBlocks.filter(b=>b.kind==='child');
 assert.equal(newChildren.filter(block=>oldChildren.some(old=>old.id===block.id)).length,7);assert.notEqual(newChildren.find(b=>b.sourceText.includes('递给')).sourceHash,oldChildren.find(b=>b.sourceText.includes('交给')).sourceHash);
});

test('中文关键词能命中专名、精确短语并压低无关文本',()=>{
 const c=runtime();run(c,'memoryTokens','memoryKeywordScore');
 const exact=c.memoryKeywordScore('星图 林岚','第1章：林岚将星图交给顾迟。'),related=c.memoryKeywordScore('星图 林岚','林岚持有一张星图。'),unrelated=c.memoryKeywordScore('星图 林岚','顾迟在练剑。');
 assert.ok(exact>0);assert.ok(related>0);assert.equal(unrelated,0);
});

test('预算扣除章节标题、摘要和说明，摘要章数与摘要上限生效',()=>{
 const rows=Array.from({length:4},(_,i)=>({id:'c'+i,title:'章'+i,content:'正'.repeat(3000),summary:'摘'.repeat(900)})),c=runtime({visibleChapters:{value:rows},getValidMemoryRows:()=>[]});
 c.settings.value.contextHistoryCharLimit=2500;c.settings.value.contextFullChapters=1;c.settings.value.contextSummaryChapters=2;c.settings.value.contextMaxChapterSummaryChars=120;
 run(c,'memoryTextHash','memoryChapterHash','buildBudgetedChapterHistory');const result=c.buildBudgetedChapterHistory(rows);
 assert.ok(result.totalChars<=2500);assert.ok(result.text.includes('摘'.repeat(120)));assert.ok(!result.text.includes('摘'.repeat(121)));assert.ok(result.rawChars<=3000);assert.equal(result.budget,2000);
 c.settings.value.contextSummaryChapters=0;const withoutSummary=c.buildBudgetedChapterHistory(rows);assert.ok(!withoutSummary.text.includes('摘'));
});

test('增强召回按相关度注入明确 history 槽，不修改最后的生图 user 消息',async()=>{
 const c=runtime({getValidMemoryRows:()=>[],sanitizeApiErrorDetail:s=>String(s)});run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','decodeMemoryVector','memoryCosine','memoryTokens','memoryKeywordScore','appendEnhancedMemoryRecall');
 const ctx=[{id:'early',branchId:'main',title:'初遇',content:'林岚保管星图，答应在黎明交给顾迟。\n\n她隐瞒了星图缺角。'},{id:'late',branchId:'main',title:'练剑',content:'顾迟今日在院中练剑。'}];c.memoryLibrary.value.blocks=ctx.flatMap((row,index)=>c.getCurrentMemoryBlocks(row,index+1)).map(block=>({...block,vector:{data:btoa(String.fromCharCode(127,0)),scale:1,dims:2},vectorModel:'model',vectorTextHash:c.memoryTextHash(block.text)}));
 const messages=[{role:'user',content:'【历史】',_moyunContextSlot:'history'},{role:'user',content:'生成图片：星图气氛图'}];
 const out=await c.appendEnhancedMemoryRecall(messages,ctx,'林岚 星图 黎明',null);
 assert.match(out[0].content,/相关事实参考/);assert.match(out[0].content,/答应在黎明交给顾迟/);assert.doesNotMatch(out[1].content,/相关事实参考/);assert.equal(out[1].content,'生成图片：星图气氛图');assert.equal(c.memoryLastRecall.value[0].chapterId,'early');
});

test('旧记忆及版本化块 normalize 后保留，章节无来源时不会被静默删除',()=>{
 const c=runtime();run(c,'normalizeMemoryLibrary');const old={chapterId:'missing',branchId:'main',sourceHash:'legacy',text:'旧记忆保留',at:1},block={id:'missing:child:0',chapterId:'missing',branchId:'main',sourceHash:'legacy',kind:'child',text:'旧正文块',at:1};
 const library=c.normalizeMemoryLibrary({memories:[old],blocks:[block]});assert.equal(library.memories[0].text,'旧记忆保留');assert.equal(library.blocks[0].text,'旧正文块');
});

test('生成解析保留长摘要，记忆校验允许完整摘要进入历史',()=>{
 const c=runtime({visibleChapters:{value:[]},extractResponseReasoningBlocks:text=>({body:text,thinking:''}),stripSnowwingVisiblePromptLeaks:text=>text,splitByLastPlainMarker:()=>null,
  extractContentRegion:text=>({found:false,before:'',body:'',after:'',text}),splitSummaryTail(text){const at=text.lastIndexOf('---剧情摘要---');return at<0?null:{content:text.slice(0,at).trim(),summary:text.slice(at+'---剧情摘要---'.length).trim()};},
  stripSummaryHeading:text=>String(text||'').replace(/^---剧情摘要---\s*/,'').trim(),splitSnowwingChapterStoryTime:(content)=>({storyTime:'',content:String(content||'')}),stripContentWrappers:text=>String(text||''),extractChapterTitleAndContent:(title,content)=>({title:'长摘要测试',content}),cleanChapterTitleCandidate:text=>text,buildDefaultChapterTitle:no=>'第'+no+'章',cleanAIResponse:text=>String(text||'')});
 run(c,'parseChapter','isUsableChapterSummary');const summary='重要事实'.repeat(80),parsed=c.parseChapter('正文事实\n---剧情摘要---\n'+summary);assert.equal(parsed.summary,summary);assert.ok(parsed.summary.length>120);assert.ok(c.isUsableChapterSummary(summary));
});

test('手动建立向量后不重复请求；只修改一段时只重建该段和所属父块',async()=>{
 const calls=[],c=runtime();run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','encodeMemoryVector','decodeMemoryVector','indexMemoryRows');
 const rows=[{id:'a',branchId:'main',title:'第一章',content:'林岚保管星图。'},{id:'b',branchId:'main',title:'第二章',content:'顾迟练习剑法。'}];c.memoryLibrary.value.memories=rows.map(ch=>({chapterId:ch.id,branchId:'main',sourceHash:c.memoryChapterHash(ch),sourceUserText:'',text:'摘要 '+ch.id,enabled:true}));
 c.chapters.value=rows;c.getValidMemoryRows=context=>context.map(ch=>c.memoryLibrary.value.memories.find(memory=>memory.chapterId===ch.id)).filter(memory=>memory&&memory.sourceHash===c.memoryChapterHash(context.find(ch=>ch.id===memory.chapterId)));
 c.fetchMemoryEmbeddings=async(req,inputs)=>{calls.push(inputs.slice());return inputs.map(()=>c.encodeMemoryVector([1,0]));};
 await c.indexMemoryRows(rows,null,()=>{});const firstCalls=calls.length,firstBlocks=c.memoryLibrary.value.blocks.length;assert.ok(firstCalls>=1);assert.ok(firstBlocks>=4);
 await c.indexMemoryRows(rows,null,()=>{});assert.equal(calls.length,firstCalls,'相同内容不应重复调用向量 API');
 rows[0].content='林岚把星图交给顾迟。';c.memoryLibrary.value.memories[0].sourceHash=c.memoryChapterHash(rows[0]);
 await c.indexMemoryRows(rows,null,()=>{});assert.equal(calls.length,firstCalls+1);assert.equal(calls.at(-1).length,2);assert.ok(calls.at(-1).some(text=>text.includes('把星图交给顾迟')));
});

test('错字导致旧记忆待核对，但用户确认后可恢复且不静默替换内容',()=>{
 const c=runtime();run(c,'memoryChapterHash','confirmMemoryStillApplies');const chapter={id:'review',branchId:'main',content:'作者确认的剧情事实'},memory={chapterId:'review',branchId:'main',sourceHash:'old-hash',text:'手工整理的关系变化',vector:{data:'old'}};
 assert.equal(memory.sourceHash===c.memoryChapterHash(chapter),false);assert.equal(c.confirmMemoryStillApplies(memory,chapter),true);assert.equal(memory.sourceHash,c.memoryChapterHash(chapter));assert.equal(memory.text,'手工整理的关系变化');assert.equal(memory.vector,undefined);
});

test('没有向量索引时可直接检索原文，过大的父块不会吞掉可容纳的子块',async()=>{
 const notices=[],c=runtime({fetchMemoryEmbeddings:async()=>{throw Error('未配置向量服务');},showToast:(...args)=>notices.push(args)});
 run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','decodeMemoryVector','memoryCosine','memoryTokens','memoryKeywordScore','appendEnhancedMemoryRecall');
 const context=[{id:'source',branchId:'main',title:'物品归属',content:['林岚保管星图。'+'甲'.repeat(750),'顾迟不知道藏图地点。'+'乙'.repeat(750),'星图藏在北岸钟楼。'+'丙'.repeat(750)].join(String.fromCharCode(10,10))}];
 const out=await c.appendEnhancedMemoryRecall([{role:'user',content:'',_moyunContextSlot:'history'}],context,'林岚 星图',null);
 assert.match(out[0].content,/林岚保管星图/);assert.ok(out[0].content.length<=2500);assert.ok(notices.some(row=>row[0].includes('本地关键词检索')));assert.equal(c.memoryLibrary.value.blocks.length,0);
});

test('重排只向选定连接提交有限候选，乱序结果按分数恢复，异常索引不得采信',async()=>{
 let response={results:[{index:1,relevance_score:.9},{index:0,relevance_score:.1}]};const calls=[],c=runtime({AbortController,DOMException,setTimeout,clearTimeout,connectionCenter:{value:{profiles:[{id:'rank',enabled:true,lastTest:{status:'ok'},baseUrl:'https://rerank.invalid/v1'}]}},getConnectionCredential:()=> 'synthetic-key',getApiBaseUrl:value=>value,normalizeNoOutputTimeout:()=>1,fetch:async(url,request)=>{calls.push({url,request});return{ok:true,json:async()=>response};}});
 Object.assign(c.memoryLibrary.value.settings,{rerankEnabled:true,rerankProfileId:'rank',rerankModel:'fixture-rerank'});run(c,'fetchMemoryRerank');
 const docs=[{id:'a',text:'星图在林岚手中'},{id:'b',text:'星图已交给顾迟'}],ranked=await c.fetchMemoryRerank(docs,'星图的主人');
 assert.equal(ranked[0].id,'b');assert.equal(calls[0].url,'https://rerank.invalid/v1/rerank');assert.equal(JSON.parse(calls[0].request.body).documents.length,2);assert.equal(calls[0].request.headers.Authorization,'Bearer synthetic-key');
 for(const invalid of [{results:[{index:0,relevance_score:.9}]},{results:[{index:0,relevance_score:.9},{index:0,relevance_score:.8}]},{results:[{index:0,relevance_score:'bad'},{index:1,relevance_score:.8}]}]){response=invalid;await assert.rejects(c.fetchMemoryRerank(docs,'星图'),/重排返回/);}
});

test('索引请求等待时正文被改动，迟到结果不能写入或删除新块',async()=>{
 const c=runtime();run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','encodeMemoryVector','decodeMemoryVector','indexMemoryRows');
 const row={id:'edit',branchId:'main',content:'林岚保管星图。'};c.chapters.value=[row];
 const previous={id:'newer-block',chapterId:'edit',text:'作者最新记录',kind:'child'};c.memoryLibrary.value.blocks=[previous];
 c.fetchMemoryEmbeddings=async(req,inputs)=>{row.content='星图已经转交顾迟。';return inputs.map(()=>c.encodeMemoryVector([1,0]));};
 await c.indexMemoryRows([row],null,()=>{});assert.equal(JSON.stringify(c.memoryLibrary.value.blocks),JSON.stringify([previous]));
});

test('同一事实在摘要、原文块和近期前文中只发送一次',async()=>{
 const chapter={id:'duplicate',branchId:'main',title:'旧约',content:'林岚答应顾迟黎明前归还星图。'},c=runtime();
 c.getValidMemoryRows=()=>[{chapterId:chapter.id,text:chapter.content,sourceUserText:''}];
 run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','decodeMemoryVector','memoryCosine','memoryTokens','memoryKeywordScore','appendEnhancedMemoryRecall');
 let out=await c.appendEnhancedMemoryRecall([{role:'user',content:'',_moyunContextSlot:'history'}],[chapter],'星图',null);
 assert.equal(out[0].content.split(chapter.content).length-1,1);
 const messages=[{role:'user',content:'【前文剧情】\n'+chapter.content,_moyunContextSlot:'history'}];out=await c.appendEnhancedMemoryRecall(messages,[chapter],'星图',null);assert.equal(out[0].content,messages[0].content);assert.equal(c.memoryLastRecall.value.length,0);
});

test('同模型维度变化时召回可见降级，增量索引拒绝混用，明确重建后可恢复',async()=>{
 const notices=[],c=runtime({showToast:(text)=>notices.push(text)});run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','encodeMemoryVector','decodeMemoryVector','memoryCosine','memoryTokens','memoryKeywordScore','indexMemoryRows','appendEnhancedMemoryRecall');
 const row={id:'dims',branchId:'main',content:'林岚保管星图。'};c.chapters.value=[row];
 c.fetchMemoryEmbeddings=async(req,inputs)=>inputs.map(()=>c.encodeMemoryVector([1,0]));await c.indexMemoryRows([row],null,()=>{});
 c.fetchMemoryEmbeddings=async(req,inputs)=>inputs.map(()=>c.encodeMemoryVector([1,0,0]));
 const out=await c.appendEnhancedMemoryRecall([{role:'user',content:'',_moyunContextSlot:'history'}],[row],'星图',null);assert.match(out[0].content,/林岚保管星图/);assert.ok(notices.some(text=>text.includes('维度已变化')));
 row.content+='顾迟不知道位置。';const old=JSON.stringify(c.memoryLibrary.value.blocks);await assert.rejects(c.indexMemoryRows([row],null,()=>{}),/维度已变化/);assert.equal(JSON.stringify(c.memoryLibrary.value.blocks),old);
 await c.indexMemoryRows([row],null,()=>{},true);assert.ok(c.memoryLibrary.value.blocks.every(block=>block.vector.dims===3));
});

test('同预算八事实对照：旧摘要、关键词、向量与混合均检查最终发送；语义向量为固定 mock',async t=>{
 const {execFileSync}=require('node:child_process'),oldSource=execFileSync('git',['show','7c79920:source/moyun.single.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:12*1024*1024}).replace(/\r\n/g,'\n');
 const at=oldSource.indexOf('    async function appendEnhancedMemoryRecall('),oldRecall=oldSource.slice(at,oldSource.indexOf('\n    }',at)+6);
 const facts=[['林岚','林岚保管星图。'],['白鸢','白鸢就是林岚，顾迟知道这个别名。'],['交付地图','林岚将星图交给顾迟，从此由顾迟保管。'],['北岸钟楼','北岸钟楼的旧约仍未履行。'],['第三重','顾迟已突破第三重，旧伤尚未痊愈。'],['秘密','星图缺角的秘密只有林岚知晓。'],['开门工具','第一卷得到的铜钥匙能开启第三卷南门。'],['封蜡','旧信的红色封蜡来源尚未解释。']];
 const counts={},evidence=[];
 for(const mode of ['old','keyword','vector','hybrid']){
  const c=runtime(),rows=facts.map((fact,i)=>({id:'comparison-'+i,branchId:'main',title:'事实'+i,content:fact[1]}));c.settings.value.contextHistoryCharLimit=3000;c.chapters.value=rows;
  run(c,'memoryChapterHash','splitMemoryBlocks','getCurrentMemoryBlocks','encodeMemoryVector','decodeMemoryVector','memoryCosine','memoryTokens','memoryKeywordScore','appendEnhancedMemoryRecall');
  const vector=index=>c.encodeMemoryVector(facts.map((_,i)=>i===index?1:0));
  c.memoryLibrary.value.memories=rows.map((chapter,i)=>{const text=i<4?chapter.content:'人物继续前进，具体物品与知情人未写入短摘要。';return{chapterId:chapter.id,sourceUserText:'',sourceHash:c.memoryChapterHash(chapter),text,vector:vector(i),vectorModel:'model',vectorTextHash:c.memoryTextHash('\n'+text)};});
  c.getValidMemoryRows=()=>c.memoryLibrary.value.memories;
  c.memoryLibrary.value.blocks=rows.flatMap((chapter,i)=>c.getCurrentMemoryBlocks(chapter,i+1).map(block=>({...block,vector:vector(i),vectorModel:'model',vectorTextHash:c.memoryTextHash(block.text)})));
  c.fetchMemoryEmbeddings=async(_req,inputs)=>{if(mode==='keyword')throw Error('本轮只测关键词');return inputs.map(query=>vector(facts.findIndex(fact=>fact[0]===query)));};
  if(mode==='vector')c.memoryKeywordScore=()=>0;if(mode==='old')vm.runInContext(oldRecall,c);
  let finalHits=0;
  for(const [query,expected] of facts){const out=await c.appendEnhancedMemoryRecall([{role:'user',content:'',_moyunContextSlot:'history'}],rows,query,null),text=out.map(message=>message.content).join('\n'),sent=text.includes(expected);if(sent)finalHits++;assert.ok(text.length<=3000);evidence.push({mode,query,candidatesSent:c.memoryLastRecall.value.length,finalHit:sent,chars:text.length});}
  counts[mode]=finalHits;
 }
 assert.equal(counts.old,4);assert.ok(counts.keyword>=6);assert.equal(counts.vector,8);assert.equal(counts.hybrid,8);
 t.diagnostic(JSON.stringify({synthetic:true,realProvider:false,budget:3000,facts:8,counts,evidence}));
});
