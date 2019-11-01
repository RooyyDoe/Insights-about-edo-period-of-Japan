import App from './App.svelte';
import Home from './pages/Home.svelte'
import Gokomyo from './pages/Gokomyo.svelte';
import Gomizunoo from './pages/Gomizunoo.svelte';
import Gomomozono from './pages/Gomomozono.svelte';
import Gosai from './pages/Gosai.svelte';
import Gosakuramachi from './pages/Gosakuramachi.svelte';
import Nakamikado from './pages/Nakamikado.svelte';
import Higashiyama from './pages/Higashiyama.svelte';
import Kokaku from './pages/Kokaku.svelte';
import Komei from './pages/Komei.svelte';
import Meisho from './pages/Meisho.svelte';
import Momozono from './pages/Momozono.svelte';
import Ninko from './pages/Ninko.svelte';
import Reigen from './pages/Reigen.svelte';
import Sakuramachi from './pages/Sakuramachi.svelte';

export {
	Home,
	Gokomyo,
	Gomizunoo,
	Gomomozono,
	Nakamikado,
	Gosai,
	Gosakuramachi,
	Higashiyama,
	Kokaku,
	Komei,
	Meisho,
	Momozono,
	Ninko,
	Reigen,
	Sakuramachi
};

const app = new App({
	target: document.body,
	props: {
		title: 'Cultural insights in the Edo period of Japan'
	}
});

export default app;