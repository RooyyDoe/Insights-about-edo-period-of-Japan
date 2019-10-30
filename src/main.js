import App from './App.svelte';
import Home from './pages/Home.svelte'
import Gokomyo from './pages/Gokomyo.svelte';
import Gomizunoo from './pages/Gomizunoo.svelte';
import Gomomozono from './pages/Gomizunoo.svelte';
import Gosai from './pages/Gomizunoo.svelte';
import Gosakuramachi from './pages/Gomizunoo.svelte';
import Higashiyama from './pages/Gomizunoo.svelte';
import Kokaku from './pages/Gomizunoo.svelte';
import Komei from './pages/Gomizunoo.svelte';
import Meisho from './pages/Gomizunoo.svelte';
import Momozono from './pages/Gomizunoo.svelte';
import Ninko from './pages/Gomizunoo.svelte';
import Reigen from './pages/Gomizunoo.svelte';
import Sakuramachi from './pages/Gomizunoo.svelte';

export {
	Home,
	Gokomyo,
	Gomizunoo,
	Gomomozono,
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